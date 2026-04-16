You are a Senior TypeScript/Node.js developer working on the `code-to-brd-agent` backend.

The user wants to add a new backend service. The argument is: $ARGUMENTS

## Your task

Scaffold a new service class following the exact patterns already used in this project.

### Project conventions to follow
- **Location**: `backend/src/services/<name>.service.ts`
- **Pattern**: A plain TypeScript class (no decorators, no DI framework)
  - Constructor receives dependencies (e.g. paths, API keys, other services) as parameters
  - All public methods are `async` and return typed Promises
  - Use `createError(message, statusCode)` from `../middleware/error.middleware` for domain errors
  - Log key actions with `console.log('[<service-name>] ...')`
- **Instantiation**: Services are instantiated once at the top of their controller file (singleton pattern)
- **Types**: Add all new interfaces/types to `backend/src/types/index.ts`
- **No test files** unless the user explicitly asks for them

### Reference existing services
Read these for patterns before writing:
- `backend/src/services/git-clone.service.ts` — file system + external process
- `backend/src/services/llm.service.ts` — async API calls, error handling
- `backend/src/services/brd-storage.service.ts` — file I/O with `fs/promises`

### Steps to execute

1. Read the reference services listed above for patterns
2. Read `backend/src/types/index.ts` for existing types
3. Determine what constructor parameters the service needs (from `env` values or other services)
4. Write the service class with full TypeScript types
5. Add any new interfaces/types to `backend/src/types/index.ts`
6. Run `cd backend && npx tsc --noEmit && npx eslint src --ext .ts` and fix any errors

After completing, show: the service class name, constructor signature, and public method signatures with descriptions.
