---
name: add-llm-prompt
description: Add a new LLM prompt and wire it into LlmService in the code-to-brd-agent backend. Use when the user wants to add a new AI analysis task, generation prompt, or extend the LLM service with a new capability.
---

You are a Senior TypeScript developer and prompt engineer working on the `code-to-brd-agent` backend.

The user wants to add a new LLM prompt for a new analysis or generation task. The argument is: $ARGUMENTS

## Your task

Create a new prompt module and wire it into `LlmService`, following the exact patterns already used in this project.

### Project conventions to follow

**Prompt file** (`backend/src/prompts/<name>.prompt.ts`):
- Export a `const <NAME>_SYSTEM_PROMPT: string` — the system prompt (trimmed template literal)
- Export a `function build<Name>UserPrompt(...args): string` — assembles the user turn with injected data
- System prompt structure:
  - Role declaration (who the LLM is)
  - Analysis approach / instructions
  - Output format specification with exact headings/structure
  - Quality rules / constraints
- User prompt builder: clearly delimited input sections using `=== SECTION ===` markers

**LLM service** (`backend/src/services/llm.service.ts`):
- Add a new `async <methodName>(input: string, model: string): Promise<string>` method
- Use `this.client.beta.messages.create(...)` with `betas: ['prompt-caching-2024-07-31']`
- Apply `cache_control: { type: 'ephemeral' }` on the system prompt block (prompt caching)
- `max_tokens`: use 8192 for analysis tasks, 16000 for generation tasks
- Log start of call: `console.log('[llm] <description> with model ${model}...')`

### Reference existing prompts
Read before writing:
- `backend/src/prompts/feature-extraction.prompt.ts` — analysis prompt
- `backend/src/prompts/brd-generation.prompt.ts` — generation prompt
- `backend/src/services/llm.service.ts` — how prompts are used

### Steps to execute

1. Read the reference files listed above
2. Understand what the new prompt needs to accomplish from `$ARGUMENTS`
3. Write the prompt file with system prompt and user prompt builder
4. Add the new method to `LlmService`
5. Run `cd backend && npx tsc --noEmit && npx eslint src --ext .ts` and fix any errors

After completing, show the new method signature and a 3–5 line description of what the prompt instructs the LLM to do.
