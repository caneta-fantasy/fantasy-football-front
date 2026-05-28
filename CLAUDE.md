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

- React 19.0.0 + TypeScript 4.9.5
- Material UI (MUI) 7.0.0
- React Query (TanStack) 5.71.5
- React Router DOM 7.4.1
- Axios 1.8.4
- date-fns / dayjs

## Commands

```bash
npm start       # Dev server on http://localhost:3000
npm test        # Run tests
npm run build   # Production build
```

## Project Structure

```
src/
├── api/           # API queries, mutations, config
├── components/    # Reusable React components
├── context/       # React Context (AuthContext)
├── pages/         # Page components (routes)
├── utils/         # Utility functions
└── App.tsx        # Main app with routing
```

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
Backend URL configured in `src/api/config.ts`:
```typescript
export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
```

## Component Conventions

- Pages in `src/pages/` correspond to routes
- Modals are separate components (e.g., `CreateLeagueModal`, `AddPlayerModal`)
- Forms use MUI components with controlled inputs

## Environment Variables

Create `.env` file:
```
REACT_APP_BACKEND_URL=http://localhost:4000
```

## Testing

- Jest + React Testing Library
- Test files: `*.test.tsx`
- Setup in `src/setupTests.ts`
