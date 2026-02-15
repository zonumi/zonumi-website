# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js 15 + TypeScript site for Zonumi.

- `src/app/`: App Router entrypoints (`layout.tsx`, `page.tsx`, global styles, loading UI).
- `src/components/`: Reusable UI components (PascalCase files, e.g., `ProjectTimeline.tsx`).
- `src/lib/`: Data/loading helpers (for example `markdown-utils.ts` reads markdown content).
- `content/`: Source content in markdown (`profile.md` and `content/projects/*.md`).
- `public/`: Static assets, including client logos under `public/branding/clients/`.
- `artifacts/`: Visual snapshots/reference images used during design iterations.

## Build, Test, and Development Commands
Use npm scripts from `package.json`:

- `npm run dev`: Start local development server.
- `npm run build`: Create a production build (also catches many type/runtime issues).
- `npm run start`: Serve the built app.
- `npm run lint`: Run ESLint with Next.js core-web-vitals rules.

Typical local validation before PR:
`npm run lint && npm run build`

## Coding Style & Naming Conventions
- Language: TypeScript (`strict` mode enabled in `tsconfig.json`).
- Indentation: 2 spaces; prefer double quotes and semicolons to match existing code.
- Components/types: `PascalCase` (e.g., `ContactActions`, `Project`).
- Variables/functions: `camelCase`; constants: `UPPER_SNAKE_CASE` for true constants.
- File naming: components in `PascalCase.tsx`; utility modules in `kebab-case.ts` where already used.
- Imports: use `@/*` alias for `src/*` paths when practical.

## Testing Guidelines
There is currently no dedicated test runner configured. Until one is added:

- Treat `npm run lint` and `npm run build` as required checks.
- For content changes, verify affected pages in `npm run dev`.
- If adding tests, keep them colocated or under a `tests/` folder and use `*.test.ts(x)` naming.

## Commit & Pull Request Guidelines
- Current history mostly uses `WIP` commits; for new work, prefer clear, imperative messages like:
  - `feat: add timeline filter chips`
  - `fix: correct markdown skill parsing`
- Keep commits focused by concern (UI, content, config).
- PRs should include:
  - concise summary of what changed and why,
  - linked issue/task (if available),
  - screenshots for visual changes,
  - verification notes (`lint`, `build`, and manual checks).
