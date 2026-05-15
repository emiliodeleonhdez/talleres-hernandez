@AGENTS.md

# Project Conventions

## TypeScript
- Use `interface` for component props (not `type`), consistent with shadcn/ui.

## Component Structure
- `src/components/ui/` — shadcn primitives only, do not add custom components here.
- `src/components/layout/` — layout wrappers (AppHeader, AppSidebar, etc.).
- `src/components/shared/` — reusable components used across multiple pages.
- `src/components/<section>/` — components specific to a section (e.g. `clientes/`, `ordenes/`). Created when needed.
- File names use kebab-case: `stat-card.tsx`, `input-group.tsx`.

## Routing
- Each page lives at `src/app/<section>/page.tsx` → maps to `/<section>`.
- No colocation of components inside `app/` — keep `app/` for routing files only.
- Sections: home (`/`), clientes, ordenes, inventario, caja.
- Route folders use Spanish (user-facing URLs). Function/component names use English.

