# Claude Skills — code-to-brd-agent

Custom slash commands (Claude Skills) for this project. Skills live in `.claude/skills/` and are
invoked inside Claude Code with `/skill-name [arguments]`.

---

## Available Skills

### Backend (Node.js / Express / TypeScript)

| Skill | Command | Purpose |
|-------|---------|---------|
| Add Endpoint | `/add-endpoint` | Scaffold a new REST endpoint (router + controller + Swagger JSDoc + types) |
| Add Service | `/add-service` | Scaffold a new backend service class |
| Add LLM Prompt | `/add-llm-prompt` | Add a new LLM prompt module and wire it into `LlmService` |
| Add Language Parser | `/add-language-parser` | Add tree-sitter support for a new programming language |

### Frontend (React / TypeScript / Vite)

| Skill | Command | Purpose |
|-------|---------|---------|
| Add Component | `/add-component` | Scaffold a new typed React component and integrate it into the workflow |
| Add API Method | `/add-api-method` | Add a typed API client function and optional `useWorkflow` handler |
| Component Styling | `/component-styling` | Enforce CSS/BEM styling conventions across frontend components |

### Full-Stack

| Skill | Command | Purpose |
|-------|---------|---------|
| Lint Check | `/lint-check` | Run `tsc --noEmit` + ESLint on both workspaces; auto-fix any errors found |

---

## Skill Details & Examples

---

### `/add-endpoint`

**File**: `.claude/skills/add-endpoint/SKILL.md`

Scaffolds a complete REST endpoint following project conventions:
- Router file with Zod validation and `@openapi` JSDoc annotations
- Controller with try/catch error handling
- Types in `backend/src/types/index.ts`
- Registration in `backend/src/routes/index.ts`
- Swagger schema additions if needed

**Usage examples:**

```
/add-endpoint GET /api/repositories/:repoId — return metadata for a single cloned repo

/add-endpoint POST /api/parse/batch — accept an array of repoIds and parse all of them, returning a summary per repo

/add-endpoint DELETE /api/repositories/:repoId — remove a cloned repository from local storage
```

---

### `/add-service`

**File**: `.claude/skills/add-service/SKILL.md`

Scaffolds a new `backend/src/services/<name>.service.ts` class following the project pattern:
plain TypeScript class, constructor-injected dependencies, `async` methods, `createError` for domain errors.

**Usage examples:**

```
/add-service CacheService — in-memory LRU cache for AST parse results, keyed by repoId

/add-service GithubAuthService — exchange a GitHub OAuth code for an access token and store it per-session

/add-service ReportExportService — convert a BRD Markdown string to PDF using puppeteer
```

---

### `/add-llm-prompt`

**File**: `.claude/skills/add-llm-prompt/SKILL.md`

Creates a new `backend/src/prompts/<name>.prompt.ts` file with a system prompt constant and a user
prompt builder function, then adds the corresponding method to `LlmService`. Applies prompt caching
via the Anthropic beta API automatically.

**Usage examples:**

```
/add-llm-prompt non-functional requirements extractor — analyze the AST summary and identify performance, security, and scalability characteristics

/add-llm-prompt glossary generator — from a BRD, produce a structured glossary of domain terms with definitions

/add-llm-prompt risk assessor — analyze feature requirements and identify top 5 technical and business risks
```

---

### `/add-language-parser`

**File**: `.claude/skills/add-language-parser/SKILL.md`

Installs the `tree-sitter-<language>` npm package and wires it into `TreeSitterParserService`:
adds the grammar, registers file extensions, and updates layer detection patterns if needed.

**Usage examples:**

```
/add-language-parser Rust — add .rs file support using tree-sitter-rust

/add-language-parser C# — add .cs file support using tree-sitter-c-sharp

/add-language-parser Ruby — add .rb file support using tree-sitter-ruby, with Rails layer patterns (app/models, app/controllers, app/views)
```

---

### `/add-component`

**File**: `.claude/skills/add-component/SKILL.md`

Scaffolds a new `frontend/src/components/<ComponentName>.tsx` following project conventions:
named export, props interface, BEM CSS classes, types from `../types`.
Optionally integrates into `WorkflowPage.tsx`.

**Usage examples:**

```
/add-component RepositoryList — display a list of all cloned repos with repoId, name, and a "Use this repo" button

/add-component ParseProgressBar — show a progress indicator while tree-sitter parsing is running, with file count and language breakdown

/add-component BrdHistory — list all previously generated BRDs with filename, date, and download/preview buttons
```

---

### `/add-api-method`

**File**: `.claude/skills/add-api-method/SKILL.md`

Adds a new typed function to `frontend/src/api/client.ts`. If it's a workflow action, also adds
a handler to `useWorkflow.ts` and updates `WorkflowState` in `frontend/src/types/index.ts`.

**Usage examples:**

```
/add-api-method listBrds — GET /api/brd?repoId=... returning BrdMeta[], add to workflow state

/add-api-method deleteBrd — DELETE /api/brd/:brdId, no workflow state change needed

/add-api-method previewBrd — GET /api/brd/:brdId/preview, returns { preview, truncated, filename }
```

---

### `/component-styling`

**File**: `.claude/skills/component-styling/SKILL.md`

Audits and enforces the CSS/BEM conventions across frontend components: no inline static styles,
BEM naming (`block__element--modifier`), one CSS file per component.

**Usage examples:**

```
/component-styling — audit all components for inline style violations and BEM naming issues

/component-styling WorkflowPage — check only WorkflowPage.tsx and its CSS file
```

---

### `/lint-check`

**File**: `.claude/skills/lint-check/SKILL.md`

Runs a full quality gate across both workspaces:

1. `backend` — `tsc --noEmit` then `eslint src --ext .ts`
2. `frontend` — `tsc --noEmit` then `eslint src --ext .ts,.tsx`

Reports all errors with file/line references and fixes them if any are found.

**Usage examples:**

```
/lint-check

/lint-check — run before committing to verify both workspaces are clean
```

---

## How Skills Work

Skills are folders in `.claude/skills/`, each containing a `SKILL.md` file. When you type `/skill-name argument` in Claude Code:

1. Claude reads the skill's `SKILL.md` file as the task specification
2. `$ARGUMENTS` in the file is replaced with whatever you typed after the skill name
3. Claude executes the task following the instructions, using the project's actual file paths and conventions

Skills encode your project's conventions once so you don't have to repeat them in every prompt.

---

## Adding New Skills

To add a new skill:

1. Create `.claude/skills/<skill-name>/SKILL.md`
2. Add frontmatter with `name` and `description` fields
3. Write the task description with `$ARGUMENTS` as the placeholder for user input
4. Reference specific file paths, patterns, and conventions from this project
5. Add an entry to this file under the appropriate section
