# Code-to-BRD Agent

A full-stack TypeScript application that reverse-engineers a GitHub repository into a professional **Business Requirements Document (BRD)** using static code analysis and Anthropic Claude.

## How it works

```
GitHub Repository  →  tree-sitter AST  →  Feature Requirements  →  BRD (.md)
      (clone)           (parse)              (Claude Phase 1)       (Claude Phase 2)
```

1. **Clone** — shallow-clones a public GitHub repository to local storage
2. **Parse** — walks the source tree with [tree-sitter](https://github.com/tree-sitter/node-tree-sitter), extracting classes, functions, imports and exports per file, grouped by architectural layer
3. **Extract features** — sends the AST summary to Claude, which produces structured feature-level requirements with traceability references to actual class names
4. **Generate BRD** — sends the feature requirements back to Claude, which produces a complete 10-section Business Requirements Document including use cases, Mermaid diagrams, and a traceability matrix

The BRD is saved as a Markdown file and made available for download.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js 20+, TypeScript, Express |
| AST parsing | tree-sitter (TypeScript, JavaScript, Python, Java, Go) |
| LLM | Anthropic Claude (direct via `@anthropic-ai/sdk`) or SAP AI Core foundation models |
| API docs | Swagger UI (`swagger-jsdoc` + `swagger-ui-express`) |
| Frontend | React 18, TypeScript, Vite |
| Monorepo | npm workspaces |

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20 or higher | Required for `tree-sitter` native module compatibility |
| npm | 10 or higher | Included with Node.js 20 |
| Git | any recent version | Must be available on `PATH` — used by `simple-git` to clone repositories |
| Anthropic API key | — | Required when `LLM_TYPE=Claude`. Get one at [console.anthropic.com](https://console.anthropic.com) |
| SAP AI Core credentials | — | Required when `LLM_TYPE=SAP`. See [SAP LLM Configuration](#sap-llm-configuration) below |

> **Windows users**: `tree-sitter` compiles a native Node.js add-on. If `npm install` fails with
> a build error, install the Visual Studio C++ build tools:
> ```
> npm install --global windows-build-tools
> ```
> or install **"Desktop development with C++"** via the Visual Studio Installer.

---

## Installation

```bash
# 1. Clone this repository
git clone https://github.com/your-org/code-to-brd-agent.git
cd code-to-brd-agent

# 2. Install all dependencies (backend + frontend)
npm install
```

---

## Configuration

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set the following variables:

```bash
# ── Server ────────────────────────────────────────────────────────────────────
PORT=3000                          # Port the backend listens on
NODE_ENV=development               # 'development' | 'production' | 'test'

# ── LLM provider ──────────────────────────────────────────────────────────────
LLM_TYPE=Claude                    # 'Claude' | 'SAP'

# ── Anthropic (required when LLM_TYPE=Claude) ─────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...       # Your Anthropic API key
ANTHROPIC_MODEL=claude-haiku-4-5   # Default model used when none is specified in the request

# ── SAP LLM (required when LLM_TYPE=SAP) ─────────────────────────────────────
SAP_LLM_ENDPOINT_URL=https://api.ai.prod.eu-central-1.aws.ml.hana.ondemand.com
SAP_LLM_FOUNDATION_MODEL_TO_USE=anthropic--claude-4.6-sonnet
SAP_LLM_DEPLOYMENT_ID=            # Your SAP AI Core deployment ID
SAP_LLM_AUTH_URL=                 # OAuth2 token endpoint base URL
SAP_LLM_AUTH_CLIENT_ID=           # OAuth2 client ID
SAP_LLM_AUTH_CLIENT_SECRET=       # OAuth2 client secret
SAP_LLM_ANTHROPIC_VERSION=bedrock-2023-05-31

# ── Storage ───────────────────────────────────────────────────────────────────
REPOS_ROOT=./data/repos            # Where cloned repositories are stored (relative to backend/)
OUTPUT_ROOT=./data/outputs         # Where generated BRDs and feature docs are saved
```

> The `data/` directories are created automatically on first use — you do not need to create them manually.

### Model options (LLM_TYPE=Claude)

| Model ID | Speed | Quality |
|----------|-------|---------|
| `claude-haiku-4-5` | Fastest / lowest cost | Good for development and small repos |
| `claude-sonnet-4-5` | Balanced | Recommended for most repositories |
| `claude-opus-4-5` | Most capable | Best for large or complex codebases |

The model can also be overridden per-request via the `model` field in the request body.

---

## SAP LLM Configuration

When `LLM_TYPE=SAP` the application routes all LLM calls through **SAP AI Core** instead of calling the Anthropic API directly. SAP AI Core proxies the request to the underlying foundation model (Anthropic Claude) and handles billing and access control within the SAP ecosystem.

### How it works

```
Backend  →  OAuth2 token request  →  SAP Auth Server
        →  POST /v2/inference/deployments/{id}/invoke  →  SAP AI Core  →  Claude
```

1. On each LLM call the backend fetches a short-lived OAuth2 Bearer token from the SAP auth server (token is cached for its full lifetime, minus a 60-second safety margin, so only one token fetch is needed per session).
2. The request body uses the standard Anthropic Messages API format (`anthropic_version`, `max_tokens`, `system`, `messages`). The `model` field is **not** sent — the deployed model is identified by `SAP_LLM_DEPLOYMENT_ID` in the URL.
3. The response is the standard Anthropic Messages API response (`content[].text`).

> **Note:** SAP AI Core does not support Anthropic prompt caching (`betas: ['prompt-caching-2024-07-31']`). When `LLM_TYPE=SAP`, prompt caching is disabled automatically.

### Required environment variables

| Variable | Description | Example value |
|----------|-------------|---------------|
| `SAP_LLM_ENDPOINT_URL` | Base URL of the SAP AI Core inference API | `https://api.ai.prod.eu-central-1.aws.ml.hana.ondemand.com` |
| `SAP_LLM_FOUNDATION_MODEL_TO_USE` | Foundation model identifier (informational) | `anthropic--claude-4.6-sonnet` |
| `SAP_LLM_DEPLOYMENT_ID` | SAP AI Core deployment ID for the target model | `d9bd703c16cee44a` |
| `SAP_LLM_AUTH_URL` | Base URL of the SAP OAuth2 authorization server | `https://<tenant>.authentication.<region>.hana.ondemand.com` |
| `SAP_LLM_AUTH_CLIENT_ID` | OAuth2 client ID | `sb-<uuid>!b<n>\|aisvc-...` |
| `SAP_LLM_AUTH_CLIENT_SECRET` | OAuth2 client secret | `<secret>` |
| `SAP_LLM_ANTHROPIC_VERSION` | Anthropic API version string required by SAP | `bedrock-2023-05-31` |

### Authentication flow

The backend uses the **OAuth2 Client Credentials** grant:

```
POST {SAP_LLM_AUTH_URL}/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id={SAP_LLM_AUTH_CLIENT_ID}
&client_secret={SAP_LLM_AUTH_CLIENT_SECRET}
```

The returned `access_token` (Bearer) is attached to every inference request. Tokens are cached in memory and refreshed automatically before expiry.

---

## Running locally

Open two terminals from the project root:

**Terminal 1 — Backend**
```bash
npm run dev:backend
```
The backend starts on `http://localhost:3000`.

**Terminal 2 — Frontend**
```bash
npm run dev:frontend
```
The frontend starts on `http://localhost:5173` and proxies `/api` requests to the backend automatically.

---

## Using the application

### Via the UI

1. Open `http://localhost:5173` in your browser
2. Select an Anthropic model from the dropdown
3. **Step 1 — Clone**: enter a public GitHub repository URL (e.g. `https://github.com/expressjs/express`) and click **Clone**
4. **Step 2 — Parse**: click **Parse Repository** to extract the AST structure
5. **Step 3 — Extract Features**: click **Extract Feature Requirements** — Claude analyses the AST and produces structured feature requirements
6. **Step 4 — Generate BRD**: click **Generate BRD Document** — Claude produces the full BRD; download it with the **Download .md** button

### Via the API

The full API is documented at **`http://localhost:3000/api/docs`** (Swagger UI).

Quick example using `curl`:

```bash
# 1. Clone a repository
curl -X POST http://localhost:3000/api/repositories/clone \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/expressjs/express"}'
# → { "repoId": "expressjs-express", ... }

# 2. Parse it
curl -X POST http://localhost:3000/api/parse \
  -H "Content-Type: application/json" \
  -d '{"repoId": "expressjs-express"}'
# → { "fileCount": 42, "languages": ["javascript"], "astSummary": "...", ... }

# 3. Extract feature requirements (Phase 1)
curl -X POST http://localhost:3000/api/requirements/features \
  -H "Content-Type: application/json" \
  -d '{"repoId": "expressjs-express", "model": "claude-haiku-4-5"}'
# → { "jobId": "uuid", "features": [...], "rawText": "...", ... }

# 4. Generate BRD (Phase 2) — use jobId from previous step
curl -X POST http://localhost:3000/api/brd \
  -H "Content-Type: application/json" \
  -d '{"repoId": "expressjs-express", "jobId": "<uuid>", "model": "claude-haiku-4-5"}'
# → { "brdId": "uuid", "downloadUrl": "/api/brd/uuid/download", ... }

# 5. Download the BRD
curl http://localhost:3000/api/brd/<brdId>/download -o my-brd.md
```

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/repositories/clone` | Clone a GitHub repository |
| `GET` | `/api/repositories` | List all locally cloned repositories |
| `POST` | `/api/parse` | Parse a repository with tree-sitter |
| `POST` | `/api/requirements/features` | Phase 1 — extract feature-level requirements |
| `POST` | `/api/brd` | Phase 2 — generate Business Requirements Document |
| `GET` | `/api/brd/:brdId/download` | Download a BRD as a `.md` file |
| `GET` | `/api/brd/:brdId/preview` | Preview first 3 000 characters of a BRD |
| `GET` | `/api/brd` | List all generated BRDs |
| `GET` | `/api/docs` | Swagger UI |

---

## Supported languages

The tree-sitter parser supports the following source languages out of the box:

| Language | Extensions |
|----------|-----------|
| TypeScript | `.ts`, `.tsx` |
| JavaScript | `.js`, `.jsx`, `.mjs` |
| Python | `.py` |
| Java | `.java` |
| Go | `.go` |

To add support for additional languages, see the `/add-language-parser` Claude skill in [`docs/claude-skills.md`](docs/claude-skills.md).

---

## Development scripts

Run from the project root:

```bash
npm run dev:backend      # Start backend in watch mode (tsx)
npm run dev:frontend     # Start frontend dev server (Vite)
npm run build            # Production build for both workspaces
npm run lint             # ESLint across both workspaces
npm run lint:backend     # ESLint — backend only
npm run lint:frontend    # ESLint — frontend only
```

Run from `backend/` or `frontend/`:

```bash
npm run typecheck        # tsc --noEmit (type check without emitting)
npm run lint:fix         # ESLint with auto-fix
npm run build            # Compile TypeScript to dist/
npm run start            # Run compiled backend (production)
```

---

## Project structure

```
code-to-brd-agent/
├── .env.example                  # Environment variable template
├── .claude/skills/               # Claude Code custom skills (slash commands)
├── docs/                         # Project documentation
│   ├── claude-skills.md          # Skills reference with usage examples
│   └── document-generator.agent.md
├── backend/
│   └── src/
│       ├── config/env.ts         # Zod-validated environment config
│       ├── routes/               # Express routers with Swagger JSDoc
│       ├── controllers/          # Request handlers
│       ├── services/             # Business logic (git, parser, LLM, storage)
│       │   ├── llm.service.ts    # Anthropic direct — uses @anthropic-ai/sdk with prompt caching
│       │   ├── sap.llm.service.ts# SAP AI Core — OAuth2 + inference HTTP calls
│       │   └── llm.factory.ts    # Singleton: selects LlmService or SapLlmService via LLM_TYPE
│       ├── prompts/              # LLM system + user prompt templates
│       ├── middleware/           # Error handling, request validation
│       ├── swagger/              # OpenAPI spec definition
│       └── utils/                # File walker, AST layer chunker
└── frontend/
    └── src/
        ├── api/client.ts         # Typed axios wrappers
        ├── hooks/useWorkflow.ts  # Workflow state machine
        ├── components/           # React UI components
        ├── pages/                # Page-level components
        └── types/                # Shared TypeScript interfaces
```

---

## Claude Skills

This project includes custom Claude Code slash commands for common development tasks. See [`docs/claude-skills.md`](docs/claude-skills.md) for the full reference.

| Command | Purpose |
|---------|---------|
| `/add-endpoint` | Scaffold a new REST endpoint |
| `/add-service` | Scaffold a new backend service |
| `/add-llm-prompt` | Add a new LLM prompt |
| `/add-language-parser` | Add tree-sitter support for a new language |
| `/add-component` | Scaffold a new React component |
| `/add-api-method` | Add a typed API client method |
| `/lint-check` | Run full type-check + ESLint and fix errors |
