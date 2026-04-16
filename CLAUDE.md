This coding agent performs the following functionality:

1. Extract feature-level requirements from code analysis
2. Consolidate extracted feature-level requirements into comprehensive structured Business Requirements Document

### Phase 1: Feature-Level Requirements Analysis
Analyze the project codebase layer by layer (view, service, database layers) to:
- Capture functional features and their execution flows
- Generate actionable and unambiguous feature-level requirements
- Identify and consolidate overlapping or duplicate requirements
- Reference relevant class names in feature-level requirements for traceability

### Phase 2: BRD Consolidation
Transform feature-level requirements into a structured Business Requirements Document with the following sections:
1. **Project Overview** - Brief context and scope
2. **Scope** - Clear boundaries and inclusions/exclusions
3. **Consolidated Functional Requirements** - Numbered, grouped by feature including:
   - Detailed functional description of each feature
   - Validation rules and error handling
4. **Use Cases** - For each feature in GIVEN/WHEN/THEN format:
   - GIVEN [initial situation or trigger]
   - WHEN [user action or system event]
   - THEN [result or system behavior]
5. **Non-Functional Requirements** - Only if explicitly mentioned:
   - Performance, security, usability, reliability, maintainability, compatibility, scalability, disaster recovery
6. **Dependencies and Preconditions** - External dependencies and prerequisites
7. **Assumptions & Constraints** - Any assumptions made or limitations
8. **Mermaid Diagrams** - Sequence diagrams illustrating use case flows:
   - Group use cases with `alt` keyword where applicable
   - Show interactions between actors and system components
9. **Traceability Matrix** - Map requirements to features/classes
10. **Open Questions/Risks** - Identified potential questions and unresolved items


### Technical stack and libraries usage:
1. Backend: (NodeJS + TypeScript + Express + LLM API).
Contains REST endpoints to: Downloads repositories from git, Parse repositories to AST, Extract feature level requirements from repository source, convert feature level requirements to Business Requirements document.
Uses NodeJS tree-sitter library to parse the provided github repository.
2. Frontend: (ReactJS + TypeScript): Allows to iteract with agent. Can select repository, authorize to github, specify Anthropic model for usage.

---

## Claude Skills (Custom Slash Commands)

This project ships with Claude Skills in `.claude/commands/` to automate common development tasks.
Full documentation with usage examples: [`docs/claude-skills.md`](docs/claude-skills.md)

### Backend skills
| Command | Purpose |
|---------|---------|
| `/add-endpoint [description]` | Scaffold a new REST endpoint (router + controller + Swagger + types) |
| `/add-service [description]` | Scaffold a new backend service class |
| `/add-llm-prompt [description]` | Add a new LLM prompt and wire it into `LlmService` |
| `/add-language-parser [language]` | Add tree-sitter support for a new programming language |

### Frontend skills
| Command | Purpose |
|---------|---------|
| `/add-component [description]` | Scaffold a new React TypeScript component |
| `/add-api-method [description]` | Add a typed API client function and optional workflow handler |

### Full-stack skills
| Command | Purpose |
|---------|---------|
| `/lint-check` | Run `tsc --noEmit` + ESLint across both workspaces and fix any errors |