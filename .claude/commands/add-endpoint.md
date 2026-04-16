You are a Senior TypeScript/Node.js developer working on the `code-to-brd-agent` backend (Express + TypeScript).

The user wants to add a new REST endpoint. The argument is: $ARGUMENTS

## Your task

Scaffold a complete, production-ready endpoint following the exact patterns already used in this project:

### Project conventions to follow
- **Router file**: `backend/src/routes/<resource>.router.ts`
  - Use `express.Router()`
  - Import `validateBody` from `../middleware/validate.middleware`
  - Define a Zod schema for request body validation
  - Add JSDoc `@openapi` annotations for every route (used by swagger-jsdoc)
  - Export a `const <resource>Router = Router()`
- **Controller file**: `backend/src/controllers/<resource>.controller.ts`
  - Each handler is `async (req, res, next) => Promise<void>`
  - Always wrap in try/catch and call `next(err)` on error
  - Use `createError(message, statusCode)` from `../middleware/error.middleware` for domain errors
  - Import `env` from `../config/env` for config values
- **Types**: Add request/response interfaces to `backend/src/types/index.ts`
- **Register the router**: Import and mount it in `backend/src/routes/index.ts` using `apiRouter.use('/resource', resourceRouter)`
- **Swagger schemas**: If new schemas are needed, add them to the `components.schemas` object in `backend/src/swagger/swagger.ts`

### Steps to execute

1. Read `backend/src/routes/index.ts` to understand existing router registrations
2. Read `backend/src/types/index.ts` to understand existing types
3. Read one existing router (e.g. `backend/src/routes/repositories.router.ts`) and its controller as a pattern reference
4. Create the new router file with Zod validation and `@openapi` JSDoc
5. Create the new controller file
6. Add types to `backend/src/types/index.ts`
7. Register the router in `backend/src/routes/index.ts`
8. Add Swagger schemas if needed in `backend/src/swagger/swagger.ts`
9. Run `cd backend && npx tsc --noEmit && npx eslint src --ext .ts` and fix any errors

After completing, summarise: the new endpoint URL, HTTP method, request body shape, and response shape.
