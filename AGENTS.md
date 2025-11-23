# Repository Guidelines

## Project Structure & Module Organization
Next.js 16 App Router keeps runtime code inside `src`. Layout lives in `src/app`, with the primary experience in `src/app/(map)` and styling in `src/app/globals.css`. UI modules sit in `src/components` (map, map-control, sidebar, query, theme, ui), reusable hooks in `src/hooks`, and shared state/data helpers in `src/lib`. Static exports from `pnpm build` go to `out/`. Co-locate additions with their domain: map widgets in `components/map*`, query UI in `components/query`, primitives in `components/ui`.

## Build, Test, and Development Commands
- `pnpm dev` – local server on http://localhost:3000 with hot reload.
- `pnpm build` – Next static export respecting `next.config.ts` (unoptimized images, dev indicators bottom-right).
- `pnpm start` – serves the production output for smoke testing.
- `pnpm lint` – flat ESLint stack (Next core web vitals, typescript-eslint strict, react, TanStack Query, unused imports).
- `pnpm format` / `pnpm fix` – check or enforce Prettier + ESLint autofixes; run before every PR.

## Coding Style & Naming Conventions
TypeScript is mandatory; use `.tsx` for components and `.ts` utilities. Prettier defaults (2-space indent) are canonical. Components are arrow functions with top-level prop destructuring, JSX in PascalCase files (`CenterInfo.tsx`), hooks prefixed with `use`, and Zustand/query helpers under `lib` with descriptive kebab-case filenames. Avoid `console` except `warn`/`error`, remove unused imports, and compose via shadcn-style primitives in `components/ui`.

## Testing Guidelines
Automated tests are not yet scaffolded, so `pnpm lint` plus manual QA in `pnpm dev` is the current gate. When adding coverage, colocate `*.test.tsx` files beside the component or inside `src/__tests__`, use React Testing Library for UI logic, and keep fixtures lean. Document manual steps (map load, PMTiles switching, query filters, theming) in the PR until end-to-end tooling such as Playwright is introduced.

## Commit & Pull Request Guidelines
History uses conventional commits (`feat: integrate pmtiles support in map component`); continue `type: summary` with lowercase types (`feat`, `fix`, `chore`, `refactor`). Each PR must include a succinct purpose, linked issue, screenshots or recordings for UI changes, commands executed (`pnpm lint`, `pnpm build`), and any config or data updates. Keep scope tight and spell out follow-ups.

## Map & Data Configuration Tips
Map rendering depends on `maplibre-gl`, `react-map-gl`, `pmtiles`, Zustand, and TanStack Query. Place dataset loaders or derived state helpers in `src/lib`, surface them through hooks in `src/hooks`, and inject them via props into `components/map*`. Reference secrets or tile endpoints through `.env.local` variables (never hard-coded).
