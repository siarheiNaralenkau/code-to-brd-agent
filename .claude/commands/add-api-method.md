You are a Senior TypeScript developer working on the `code-to-brd-agent` frontend API client.

The user wants to add a new API client method. The argument is: $ARGUMENTS

## Your task

Add a typed API client function and any necessary types, following the exact patterns in this project.

### Project conventions to follow

**API client** (`frontend/src/api/client.ts`):
- Each function is a standalone `async` named export
- Use the `api` axios instance (already configured with `baseURL: '/api'`)
- Always type the Axios call: `api.post<ResponseType>(path, body)` / `api.get<ResponseType>(path)`
- Return `res.data` (not the full Axios response)
- For download URLs, return a plain string (not a Promise) — see `getBrdDownloadUrl`

**Types** (`frontend/src/types/index.ts`):
- Add request/response interfaces here if they don't already exist
- Match the backend `backend/src/types/index.ts` shape exactly (same field names and types)
- Never duplicate a type that already exists in either file

**`useWorkflow` hook** (`frontend/src/hooks/useWorkflow.ts`):
- If the new API method is part of the main workflow, add a handler (`handle<Action>`) to this hook
- Handler pattern: `setLoading(true)` → `try { await apiMethod(...) → setState(...) } catch { setError(...) }`
- Add any new state fields to the `WorkflowState` interface in `frontend/src/types/index.ts`

### Reference
Read before writing:
- `frontend/src/api/client.ts` — existing function patterns
- `frontend/src/types/index.ts` — existing types
- `frontend/src/hooks/useWorkflow.ts` — how API calls integrate into workflow state

### Steps to execute

1. Read the three reference files listed above
2. Add the new type(s) to `frontend/src/types/index.ts` if needed
3. Add the new function to `frontend/src/api/client.ts`
4. If it's a workflow action, add the handler to `useWorkflow.ts` and update `WorkflowState`
5. Run `cd frontend && npx tsc --noEmit && npx eslint src --ext .ts,.tsx` and fix any errors

After completing, show the function signature, types used, and whether a workflow handler was added.
