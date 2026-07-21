# AGENTS.md

Guidelines for AI agents working on this project.

## Available Custom Agents

### 1. Feature Builder Agent

**Purpose:** Scaffold a new feature following the project's architecture.

**Workflow:**

1. Create folder at `src/features/<feature-name>/`
2. Setup sub-folders: `components/`, `types/`, `hooks/`, `data/` (as needed)
3. Create page at `app/(portfolio)/` or `app/(apps)/` depending on layout
4. Define types first
5. Implement components following existing patterns
6. Use `"use client"` only when necessary (browser APIs, hooks, interactivity)

**Checklist:**

- [ ] Types defined in `types/` folder
- [ ] Components follow naming convention (PascalCase)
- [ ] Imports sorted (simple-import-sort)
- [ ] Dark mode supported
- [ ] Responsive design (mobile-first)
- [ ] Accessibility (semantic HTML, aria-labels)

---

### 2. Blog Writer Agent

**Purpose:** Create a new blog post in MDX format.

**Workflow:**

1. Create file at `src/blogs/<slug>.mdx`
2. Add frontmatter (title, description, date, tags, image)
3. Create cover image SVG at `public/images/blog/`
4. Write content with proper markdown headings
5. Ensure code blocks have language identifiers

**Template:**

````mdx
---
title: "Blog Title"
description: "Brief description for SEO"
date: "YYYY-MM-DD"
tags: ["tag1", "tag2"]
image: "/images/blog/slug-name.svg"
---

## Introduction

Content here...

## Sub-heading

More content...

```typescript
// Code example
const example = "highlighted";
```
````

---

### 3. API Route Agent

**Purpose:** Create a new API route with best practices.

**Workflow:**

1. Create route at `app/api/<path>/route.ts`
2. Use Edge runtime when possible
3. Implement rate limiting
4. Handle errors with proper status codes
5. Add input validation (Zod)

**Template:**

```typescript
import { NextRequest, NextResponse } from "next/server";

import { rateLimit } from "@/src/shared/lib/services/rate-limit";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  try {
    // Implementation
    return NextResponse.json({ data: [] });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

---

### 4. Component Builder Agent

**Purpose:** Create reusable components following the design system.

**Workflow:**

1. Determine placement: shared (`src/shared/components/`) or feature-specific
2. Define props interface
3. Implement with Tailwind + design system classes
4. Support dark mode
5. Add animations if needed (Framer Motion)

**Design System References:**

- Glass effect: `.glass` class
- Bento grid: `.bento-1x1`, `.bento-2x1`, `.bento-1x2`, `.bento-2x2`
- Typography: `.h1`, `.h2`, `.h3`, `.subtitle`
- Colors: emerald/teal/cyan neon palette
- Animations: shimmer, float, glow-pulse, gradient-x, blob, tilt

---

### 5. Test Writer Agent

**Purpose:** Write unit tests for components or hooks.

**Workflow:**

1. Create test file in `tests/` mirroring `src/` path
2. Import from `bun:test` (describe, expect, it, mock)
3. Use @testing-library/react for component tests
4. Mock external dependencies with `mock.module()`
5. Focus on behavior, not implementation details

**Template:**

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, mock } from "bun:test";

import { MyComponent } from "@/src/path/to/MyComponent";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent prop="value" />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("should handle interaction", async () => {
    const user = userEvent.setup();
    render(<MyComponent prop="value" />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Clicked")).toBeInTheDocument();
  });
});
```

---

## General Rules

- Always run `bun run lint` after creating new files
- Ensure `bun test` stays passing after changes
- Use `cn()` utility for merging Tailwind classes
- Prefer Server Components unless interactivity is needed
- All pages must be responsive and support dark mode
- Use `@/` path alias for all imports
- Follow Conventional Commits for git messages
