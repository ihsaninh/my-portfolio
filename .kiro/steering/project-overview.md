# Project Overview

This is the personal portfolio & apps platform of Ihsan Nurul Habib (ihsaninh.com), built with modern web technologies.

## Tech Stack

- **Framework:** Next.js 15 (App Router) with React 19
- **Language:** TypeScript 5 (strict mode)
- **Runtime:** Bun (package manager, test runner, script executor)
- **Styling:** Tailwind CSS v4 + CSS variables, dark mode via `class` (next-themes, default dark)
- **State:** TanStack React Query (server state), Zustand (client state)
- **Data:** Supabase (PostgreSQL)
- **AI:** Vercel AI SDK + Google Gemini (RAG-based chat)
- **Content:** MDX (blog posts in `src/blogs/`)
- **Forms:** React Hook Form + Zod
- **Animations:** Framer Motion + CSS animations
- **Testing:** Bun test + @testing-library/react + happy-dom, Playwright (E2E)
- **Deployment:** Vercel

## Architecture

```
app/                    → Next.js App Router (pages & API routes)
├── (portfolio)/        → Route group: main portfolio (Header/Footer)
├── (apps)/             → Route group: standalone apps (minimal layout)
└── api/                → API routes

src/                    → Business logic
├── features/           → Feature-based modules (portfolio, quiz, hire-me)
│   └── <feature>/
│       ├── components/ → Feature UI components
│       ├── data/       → Static data
│       ├── hooks/      → Feature-specific hooks
│       └── types/      → Feature-specific types
├── shared/             → Cross-feature shared code
│   ├── components/     → Reusable UI (Header, Footer, BentoCard, providers)
│   ├── hooks/          → Shared hooks
│   ├── lib/            → Utilities, services, AI, SEO, MDX processing
│   └── types/          → Shared types (database.ts)
└── blogs/              → MDX blog content

tests/                  → Unit tests (mirrors src structure)
```

## Path Alias

- `@/*` maps to project root → e.g., `@/src/shared/lib/utils`

## Key Commands

- `bun run dev` — Start dev server (Turbopack)
- `bun run build` — Production build
- `bun run lint` — Lint with ESLint
- `bun run lint:fix` — Auto-fix lint issues
- `bun test` — Run unit tests
- `bun test --watch` — Run tests in watch mode
- `bun test --coverage` — Run with coverage
