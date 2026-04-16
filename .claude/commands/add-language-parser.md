You are a Senior TypeScript/Node.js developer working on the `code-to-brd-agent` backend.

The user wants to add support for a new programming language in the tree-sitter parser. The argument is: $ARGUMENTS

## Your task

Add support for a new language to `TreeSitterParserService`, following the exact patterns already used.

### Project conventions to follow

**Grammar package**: tree-sitter grammars follow the naming pattern `tree-sitter-<language>`.
Before proceeding, check that the requested language has an available npm package.

**Files to modify**:

1. **`backend/package.json`** — add the grammar package to `dependencies`
   - Run `npm install tree-sitter-<language> --workspace=backend` from the project root

2. **`backend/src/services/tree-sitter-parser.service.ts`**:
   - Add a `require('tree-sitter-<language>')` in the eslint-disabled require block at the top
   - Add the extension(s) to the `EXT_TO_LANG` map: `'.ext': 'language-name'`
   - In `initParsers()`: create a new `Parser`, call `setLanguage()`, and `this.parsers.set('language-name', parser)`

3. **`backend/src/utils/ast-chunker.utils.ts`**:
   - Consider whether the language uses file-path patterns that fit existing layer detection (view, controller, service, repository, model, utility)
   - If the language has unique conventions (e.g. Ruby's `app/models`, Rust's `src/main.rs`), add patterns to `LAYER_PATTERNS`

4. **`backend/src/swagger/swagger.ts`**:
   - Update the `ParseResponse.parsedFiles.language` schema description to mention the new language

### Reference
Read before writing:
- `backend/src/services/tree-sitter-parser.service.ts` — existing grammar wiring pattern
- `backend/src/utils/ast-chunker.utils.ts` — layer detection patterns

### Steps to execute

1. Read the reference files
2. Verify the `tree-sitter-<language>` package exists on npm
3. Install the package and update all listed files
4. Run `cd backend && npx tsc --noEmit && npx eslint src --ext .ts` and fix any errors
5. Report: the language added, file extensions supported, and any layer patterns added.
