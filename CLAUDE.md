@AGENTS.md

# Project Conventions

## Styling
- **Never use the `style` attribute.** All styles must come from Tailwind classes.
- **Never use arbitrary values** (e.g. `mt-[13px]`). If a value isn't available as a Tailwind utility, add a custom token to `globals.css` via `@theme`.
- **Never use `!important`** — not in CSS, not in Tailwind (no `!` suffix like `translate-y-0!`, no `!` prefix like `!translate-y-0`). Redesign the approach instead.

## TypeScript
- Use `interface` for component props (not `type`), consistent with shadcn/ui.

## Component Structure
- `src/components/ui/` — shadcn primitives only, do not add custom components here.
- `src/components/layout/` — layout wrappers (AppHeader, AppSidebar, etc.).
- `src/components/shared/` — reusable components used across multiple pages.
- `src/components/<section>/` — components specific to a section (e.g. `clientes/`, `ordenes/`). Created when needed.
- File names use kebab-case: `stat-card.tsx`, `input-group.tsx`.

## Design Tokens — Order Status Colors

Each order status has a background token and a foreground (text/dot) token:

| Status | Label | Background token | Foreground token |
|---|---|---|---|
| `en-proceso` | En proceso | `--warning` / `bg-warning` | `--fofo` / `text-fofo` |
| `listo` | Listo p/ entrega | `--ready` / `bg-ready` | `--brand` / `text-brand` |
| `recibido` | Recibido | `--received` / `bg-received` | `--received-fg` / `text-received-fg` |
| `entregada` | Entregada | `--delivered` / `bg-delivered` | `--delivered-fg` / `text-delivered-fg` |

Status badge pattern: `<Badge variant="destructive" className="{bg} {fg} flex gap-1 items-center">` with a `<div className="size-2 rounded-full {dot}" />` dot inside. See `OrderCard` for the canonical implementation.

## Routing
- Each page lives at `src/app/<section>/page.tsx` → maps to `/<section>`.
- No colocation of components inside `app/` — keep `app/` for routing files only.
- Sections: home (`/`), clientes, ordenes, inventario, caja.
- Route folders use Spanish (user-facing URLs). Function/component names use English.

