## Project context

This repo is part of the **caneta-fantasy** fantasy soccer platform. The cross-cutting project documentation lives in the sibling repo `fantasy-docs` at `~/repositories/fantasy/fantasy-docs/`:

- Conventions (commits, branching, PRs apply to this repo too): `../fantasy-docs/CONVENTIONS.md`
- Glossary (PT ↔ EN domain terms): `../fantasy-docs/GLOSSARY.md`
- Architecture decisions (ADRs): `../fantasy-docs/decisions/`
- Work items in progress (design + plan): `../fantasy-docs/work/`
- Onboarding for new contributors: `../fantasy-docs/ONBOARDING.md`

### Install the project skill

For full project context across all caneta-fantasy repos, install the `caneta-fantasy-workflow` skill: symlink `../fantasy-docs/skills/caneta-fantasy-workflow.md` to `~/.claude/skills/caneta-fantasy-workflow.md`. With the skill installed, Claude has direct pointers to the project's flow (brainstorm → spec → plan → implement), conventions, and topology — for every session in any of the three repos.

If you're new to the project, start with `../fantasy-docs/ONBOARDING.md`.

---

# Fantasy Football Frontend

React 19 application for the fantasy football platform.

## Tech Stack

- React 19 + TypeScript 5
- **Vite** (build + dev server) — migrated off Create React App
- **Tailwind CSS** + a **CSS-variable design-token layer** (`src/ds/tokens.css`)
- **`src/ds/`** — the Caneta Fantasy design-system component library, documented in **Storybook**
- React Query (TanStack) 5 · React Router DOM 7 · Axios · date-fns / dayjs
- **MUI 7 is still present but being removed** screen-by-screen (strangler migration — see "Design system" below)

## Commands

```bash
npm start             # Vite dev server on http://localhost:3000
npm run build         # tsc + vite production build
npm test              # Vitest (use: npm test -- --run for a single pass)
npm run storybook     # Storybook dev (component docs)
npm run build-storybook  # Static Storybook build
```

## Project Structure

```
src/
├── api/           # API queries, mutations, config
├── ds/            # Design-system library: tokens (.css/.ts), base layer, primitives + domain patterns, Storybook stories
├── components/    # Legacy MUI components (being migrated to src/ds)
├── context/       # React Context (AuthContext)
├── pages/         # Page components (routes)
├── utils/         # Utility functions
└── App.tsx        # Main app with routing
```

## Design system (read before building any UI)

The new visual system (INK/CANETA palette, Anton + Space Grotesk + JetBrains Mono) is codified in `src/ds/`:

- **Tokens:** `src/ds/tokens.css` defines semantic CSS variables on `:root` (a `[data-theme="dark"]` hook exists but only light ships today); `src/ds/tokens.ts` is the typed mirror. They're mapped into the Tailwind theme — style with token-backed utilities (`bg-surface`, `text-text`, `font-display`, `rounded-sm`, `shadow-e2`, `z-modal`), never hardcoded hex.
- **Components:** import from `@/ds` (the barrel). Browse them in Storybook (`npm run storybook`). Each is real semantic HTML with a documented a11y contract.
- **Base layer:** `src/ds/base.css` is scoped to `[data-ds]`. Wrap a migrated screen's root in a `data-ds` element so the reset + `:focus-visible` ring apply (this scoping keeps Tailwind/DS styles from leaking into un-migrated MUI screens — Tailwind preflight is off for the same reason).
- **Migration is incremental (strangler):** new or reworked screens use `src/ds`; MUI remains only on screens not yet migrated. Per-screen ritual: swap MUI primitives → `src/ds` components, remove `@mui` imports from the file, verify `build`/`test`. `SignIn` is the reference migration.
- **Design + plan:** `../fantasy-docs/work/2026-05-design-system-migration/`. Remaining phases tracked as GitHub issues (Phase 2/3/4).

## Key Patterns

### API Calls
All API logic is in `src/api/`. Uses React Query for caching:
- Queries: `use*Queries.ts` files (e.g., `useFantasyLeagueQueries.ts`)
- Mutations: `use*Mutations.ts` files

Example:
```typescript
// Query
const { data, isLoading } = useQuery({ queryKey: ['leagues'], queryFn: fetchLeagues });

// Mutation
const mutation = useMutation({ mutationFn: createLeague, onSuccess: () => queryClient.invalidateQueries(['leagues']) });
```

### Authentication
- `AuthContext` provides `user`, `login`, `logout`
- Token stored in localStorage
- `ProtectedLayout` wraps authenticated routes
- `PublicRoute` redirects logged-in users away from login/signup

### API Configuration
Backend URL is read in `src/api/config.ts` with a `http://localhost:4000` fallback. Note: under Vite, `process.env.REACT_APP_*` is not auto-injected (a `vite.config.ts` define-shim covers it for local dev) — before deploying against a real backend, reconcile the env var and move to `import.meta.env` / `VITE_` (tracked on issue #51).

## Component Conventions

- Pages in `src/pages/` correspond to routes
- New UI is built from `src/ds` (overlays, forms, etc.); MUI is legacy-only
- Legacy modals are separate components (e.g., `CreateLeagueModal`, `AddPlayerModal`)

## Environment Variables

Create `.env` file:
```
REACT_APP_BACKEND_URL=http://localhost:4000
```

## Testing

- **Vitest** + React Testing Library (jsdom)
- Run a single pass with `npm test -- --run`
- Test files: `*.test.tsx` (co-located; `src/ds` components ship with tests + stories)
- Setup in `src/setupTests.ts`
