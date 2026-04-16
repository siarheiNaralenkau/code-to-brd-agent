You are a Senior React/TypeScript developer working on the `code-to-brd-agent` frontend.

The user wants to add a new React component. The argument is: $ARGUMENTS

## Your task

Scaffold a new React component following the exact patterns already used in this project.

### Project conventions to follow
- **Location**: `frontend/src/components/<ComponentName>.tsx` + `frontend/src/components/<ComponentName>.css`
- **Pattern**:
  - Named export (not default): `export function ComponentName(props: ComponentNameProps) { ... }`
  - Props interface defined in the same file: `interface ComponentNameProps { ... }`
  - **Styling**: All styles go in `ComponentName.css` — never use inline `style` props for static values. Use `className` attributes with BEM naming (`block__element--modifier`). Import the CSS file as a side-effect: `import './ComponentName.css';`
  - Only truly dynamic values computed at runtime may use inline `style` (e.g., a pixel width derived from a JS variable).
  - No `useState` for server data — all server state lives in `useWorkflow` hook (`frontend/src/hooks/useWorkflow.ts`)
  - Local UI state (input values, toggles) can use `useState`
  - All types imported from `../types` — never re-declare types that already exist there
  - Async calls go through `../api/client` — never call `axios`/`fetch` directly in a component

### CSS naming convention (BEM)
- Block = component name in kebab-case: `repo-cloner`
- Element = part separated by `__`: `repo-cloner__input`
- Modifier = state variant separated by `--`: `step-progress__item--active`

### Reference existing components
Read before writing:
- `frontend/src/components/ModelSelector.tsx` + `ModelSelector.css` — simple label + select with BEM classes
- `frontend/src/components/StepProgress.tsx` + `StepProgress.css` — BEM modifiers for dynamic active/done/pending states
- `frontend/src/components/BrdDownload.tsx` + `BrdDownload.css` — results display with download link

### If the component needs to appear in the main workflow
- Import and render it in `frontend/src/pages/WorkflowPage.tsx` at the appropriate step
- If it needs workflow state, pass the relevant slice from `state` and the relevant handler

### Steps to execute

1. Read `frontend/src/types/index.ts` for existing types
2. Read the reference components listed above for patterns
3. Read `frontend/src/pages/WorkflowPage.tsx` to understand where to integrate
4. Write `ComponentName.css` with all BEM class definitions
5. Write `ComponentName.tsx` using `className` attributes (no inline styles for static values)
6. Add any new types needed to `frontend/src/types/index.ts`
7. If integration is needed, update `WorkflowPage.tsx`
8. Run `cd frontend && npx tsc --noEmit && npx eslint src --ext .ts,.tsx` and fix any errors

After completing, show the component's props interface and a brief description of what it renders.
