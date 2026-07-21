# Coding Standards

## TypeScript

- Strict mode enabled — no `any` unless absolutely necessary (prefix with `// eslint-disable-next-line` if unavoidable)
- Define props as `interface` (not `type`) for components
- Place types in `types/` directory per feature or in `src/shared/types/` for shared ones
- Use path alias `@/` for all imports (e.g., `@/src/shared/lib/utils`)

## Components

- Use `"use client"` directive only when the component needs browser APIs, hooks, or interactivity
- Named exports for reusable components, default exports for pages and layouts
- Arrow functions for component definitions
- Props interface named `<ComponentName>Props`

```tsx
"use client";

import { cn } from "@/src/shared/lib/utils";

interface MyComponentProps {
  title: string;
  className?: string;
}

export const MyComponent = ({ title, className }: MyComponentProps) => {
  return <div className={cn("base-styles", className)}>{title}</div>;
};
```

## Imports

- Sorted automatically via `eslint-plugin-simple-import-sort`
- Order: external packages → internal `@/` paths → relative paths
- Unused imports are errors (auto-removed)
- Unused variables must be prefixed with `_`

## Styling

- Use Tailwind utility classes exclusively — no inline styles unless dynamic
- Use `cn()` helper (clsx + tailwind-merge) for conditional/merged classes
- CSS variables defined in `globals.css` for theming (`--accent`, `--glass-bg`, etc.)
- Dark mode classes with `dark:` prefix
- Design system classes: `.h1`, `.h2`, `.h3`, `.subtitle`, `.glass`, `.bento-*`

## State Management

- **Server state:** TanStack React Query — queries for fetching, mutations for writes
- **Client state:** Zustand stores (feature-scoped)
- **Component state:** `useState`/`useCallback` for local UI state
- No prop drilling — use providers or stores

## API Routes

- Located in `app/api/`
- Use Edge runtime when possible
- Rate limiting via `src/shared/lib/services/rate-limit.ts`
- Supabase for data access (use `supabaseServer()` in API routes, never admin in edge)

## File Placement

- New feature → `src/features/<feature-name>/`
- Shared component → `src/shared/components/`
- Shared utility/service → `src/shared/lib/services/` or `src/shared/lib/utils/`
- New page → `app/(portfolio)/` or `app/(apps)/` depending on layout needs
- Blog post → `src/blogs/<slug>.mdx`

## Naming Conventions

- Files: kebab-case for utilities/services, PascalCase for components
- Hooks: `use<Name>` (e.g., `useHeader`, `useViewport`)
- Types/Interfaces: PascalCase (e.g., `Project`, `NavLink`)
- Constants: UPPER_SNAKE_CASE or camelCase depending on context
