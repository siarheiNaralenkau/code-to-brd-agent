You are a Senior TypeScript developer working on the `code-to-brd-agent` project.

Run a full lint and type-check pass across both the backend and frontend workspaces, then report results.

## Steps to execute

1. Run TypeScript type check on the backend:
   ```
   cd backend && npx tsc --noEmit
   ```

2. Run ESLint on the backend:
   ```
   cd backend && npx eslint src --ext .ts
   ```

3. Run TypeScript type check on the frontend:
   ```
   cd frontend && npx tsc --noEmit
   ```

4. Run ESLint on the frontend:
   ```
   cd frontend && npx eslint src --ext .ts,.tsx
   ```

All commands must be run from the project root (`c:\EpamProjects\SAP\Projects\code-to-brd-agent`).

## After running

- If **all checks pass**: report "All checks passed ✓" with a summary of what was checked.
- If **there are errors**: list every error with its file path, line number, and a brief explanation. Then fix all errors one by one — do not stop at the first error. After fixing, re-run the checks to confirm clean.
- Do not use `--fix` flags on ESLint automatically — fix errors manually in the source files so the changes are reviewable.
