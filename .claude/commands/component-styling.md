You are a Senior React/TypeScript developer working on the `code-to-brd-agent` frontend.

## Component Styling Convention

All React components in this project **must** separate markup/logic from styling:

- `ComponentName.tsx` — component markup, logic, props interface, event handlers
- `ComponentName.css` — all CSS rules for that component

### Rules

1. **Never use inline `style` props** for anything that is purely presentational. Inline styles are only acceptable for truly dynamic values computed at runtime (e.g., a width driven by a JS calculation).
2. **CSS naming convention**: use BEM — `block__element--modifier`:
   - Block = component name in kebab-case (e.g., `model-selector`)
   - Element = part of the component (e.g., `model-selector__label`)
   - Modifier = state variant (e.g., `step-progress__item--active`)
3. **Import the CSS file** at the top of the `.tsx` file: `import './ComponentName.css';`
4. **One CSS file per component** — do not share CSS files between components.
5. For pages in `frontend/src/pages/`, apply the same rule: `PageName.tsx` + `PageName.css`.

### File placement

| File type | Location |
|-----------|----------|
| Component TSX | `frontend/src/components/ComponentName.tsx` |
| Component CSS | `frontend/src/components/ComponentName.css` |
| Page TSX | `frontend/src/pages/PageName.tsx` |
| Page CSS | `frontend/src/pages/PageName.css` |

### Reference examples

- [ModelSelector.tsx](frontend/src/components/ModelSelector.tsx) + [ModelSelector.css](frontend/src/components/ModelSelector.css) — simple label + select
- [StepProgress.tsx](frontend/src/components/StepProgress.tsx) + [StepProgress.css](frontend/src/components/StepProgress.css) — BEM modifiers for dynamic states
- [WorkflowPage.tsx](frontend/src/pages/WorkflowPage.tsx) + [WorkflowPage.css](frontend/src/pages/WorkflowPage.css) — page-level layout classes

### TypeScript CSS import support

The file `frontend/src/declarations.d.ts` contains `declare module '*.css';` which allows TypeScript to accept CSS side-effect imports without errors.

### Steps when adding a new component

1. Create `ComponentName.tsx` with named export and props interface
2. Create `ComponentName.css` with BEM class names for all styles
3. Add `import './ComponentName.css';` as the last import in the `.tsx` file
4. Use `className="..."` attributes — never `style={{...}}` for static values
5. Run `cd frontend && npx tsc --noEmit` to verify no type errors
