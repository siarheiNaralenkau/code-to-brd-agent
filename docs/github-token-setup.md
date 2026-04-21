# GitHub Token Setup for Private Repository Access

This guide explains how to generate a GitHub Personal Access Token (PAT) so the code-to-brd-agent can clone and analyze private repositories.

---

## Token Generation Flow

```
User → GitHub Settings → Developer Settings → Personal Access Tokens → Generate Token → Copy & Store
```

---

## Step-by-Step Instructions

### 1. Open GitHub Settings

1. Log in to [github.com](https://github.com)
2. Click your **profile photo** (top-right corner)
3. Select **Settings** from the dropdown

### 2. Navigate to Developer Settings

1. Scroll to the bottom of the left sidebar
2. Click **Developer settings**

### 3. Accessing Repositories You Don't Own

A PAT authenticates **as you** — so it can only access repos where your GitHub account has been granted access (collaborator, org member, or team member). You cannot use your token to access arbitrary private repos.

| Scenario | What's needed |
|----------|--------------|
| Your own private repos | Any PAT with `repo` / `Contents: Read` |
| Another user's private repo | They must add you as a **Collaborator**: repo → Settings → Collaborators |
| Organization private repo | An org admin must add you to the repo or a team with read access |
| Organization + SSO enabled | After generating the token, you must also **authorize it for SSO** (see below) |

#### Authorizing a Token for SAML SSO Organizations

If the organization enforces SAML single sign-on:

1. After generating the token, go to **Personal access tokens** list
2. Click **Configure SSO** next to the token
3. Click **Authorize** next to the organization name
4. Complete the SSO login flow

Without this step the token will return `403 Resource protected by organization SAML enforcement`.

---

### 4. Choose Token Type

GitHub offers two token types:

| Type | Recommended For |
|------|----------------|
| **Fine-grained tokens** | Your own repos or org repos where you are a member (org must allow fine-grained tokens) |
| **Classic tokens** | Cross-user collaborator access; orgs that haven't enabled fine-grained token support |

#### Fine-grained Token

1. Click **Personal access tokens** → **Fine-grained tokens**
2. Click **Generate new token**
3. Fill in:
   - **Token name**: e.g., `code-to-brd-agent`
   - **Expiration**: choose an appropriate duration (e.g., 90 days)
   - **Resource owner**: select the **organization** that owns the repo (not just your personal account) — the org admin may need to approve the request
   - **Repository access**: select **Only select repositories** and pick the private repos you need
4. Under **Permissions → Repository permissions**, enable:
   - `Contents` → **Read-only** (required to clone and read source files)
   - `Metadata` → **Read-only** (automatically selected)
5. Click **Generate token**

> **Note:** Some organizations restrict fine-grained token usage. If the org does not appear in the **Resource owner** dropdown, ask an admin to enable *"Fine-grained personal access tokens"* in the org's settings, or use a Classic token instead.

#### Classic Token (Best for cross-user collaborator access)

1. Click **Personal access tokens** → **Tokens (classic)**
2. Click **Generate new token (classic)**
3. Fill in:
   - **Note**: e.g., `code-to-brd-agent`
   - **Expiration**: choose a duration
4. Select scopes:
   - `repo` — full access to private repositories (includes read for any repo you are a collaborator on)
5. Click **Generate token**
6. If the repo belongs to an SSO-protected org, click **Configure SSO** → **Authorize** for that org

### 5. Copy the Token

> **Important:** GitHub shows the token only once. Copy it immediately and store it securely.

---

## Using the Token with code-to-brd-agent

Set the token as an environment variable before starting the backend:

```bash
# .env file (never commit this file)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

Or export it in your shell session:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

The agent reads `GITHUB_TOKEN` when downloading repositories via the `/api/repository/download` endpoint.

---

## Security Best Practices

- **Never commit** your token to source control — `.env` is listed in `.gitignore`
- Use **fine-grained tokens** with the minimum required permissions
- Set a **short expiration** and rotate tokens regularly
- **Revoke** the token immediately if it is accidentally exposed:
  - GitHub Settings → Developer settings → Personal access tokens → Delete

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `401 Unauthorized` | Token is missing or invalid | Check `GITHUB_TOKEN` env var is set correctly |
| `403 Forbidden` | Token lacks `repo` / `Contents` permission | Regenerate with correct scopes |
| `404 Not Found` | Repo not accessible to your account | Confirm you are a collaborator/member with read access, then re-check repo selection in the token |
| `403 Resource protected by organization SAML enforcement` | Token not authorized for SSO org | Go to token list → Configure SSO → Authorize the org |
| `Token expired` | PAT past its expiration date | Generate a new token and update `.env` |
