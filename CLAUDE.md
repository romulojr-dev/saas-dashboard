# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `pnpm dev` — start the dev server (this is a pnpm project; a `pnpm-workspace.yaml` is present)
- `pnpm build` — production build
- `pnpm start` — run the production build
- `pnpm lint` — run ESLint (flat config in [eslint.config.mjs](eslint.config.mjs))

There is no test runner configured in this project yet.

## Before writing code

[AGENTS.md](AGENTS.md) (pulled in above) requires reading the relevant guide under `node_modules/next/dist/docs/` before writing Next.js code — this project pins `next@16.3.4`, a version newer than most training data, with breaking API/convention changes from earlier Next.js. Docs are split into `01-app` (App Router) and `02-pages` (Pages Router); this project uses the App Router exclusively. Check `03-api-reference` for the current shape of APIs (e.g. route/layout prop typing) before assuming older patterns still apply.

## Architecture

Early-stage App Router project, still close to the `create-next-app` scaffold:

- [app/layout.tsx](app/layout.tsx) — root layout, loads Geist fonts, wraps `children` in `html`/`body`.
- [app/page.tsx](app/page.tsx) — default scaffold landing page (not yet replaced with product content).
- [app/login/page.tsx](app/login/page.tsx) — login route, renders `LoginForm` from `app/ui/login-form.tsx`.
- [app/ui/login-form.tsx](app/ui/login-form.tsx) — client component (`'use client'`); currently a static form with no submit handler wired up.
- [app/lib/actions.ts](app/lib/actions.ts) — empty; intended home for server actions (e.g. login form submission) but not yet implemented.
- [app/super-admin/page.tsx](app/super-admin/page.tsx) — empty; route stub for a super-admin area, not yet implemented.

Path alias `@/*` maps to the repo root (see [tsconfig.json](tsconfig.json)), e.g. `@/app/ui/login-form`.

Styling is Tailwind CSS v4 via `@tailwindcss/postcss` (see [postcss.config.mjs](postcss.config.mjs)); no `tailwind.config` file is present since v4 configures via CSS (`app/globals.css`).
