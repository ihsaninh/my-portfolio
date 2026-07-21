# Git Conventions

## Commit Messages

This project uses Conventional Commits enforced by commitlint + Husky.

### Format

```
<type>(<scope>): <subject>
```

### Allowed Types

- `feat` — A new feature
- `fix` — A bug fix
- `docs` — Documentation only changes
- `style` — Changes that do not affect the meaning of the code (formatting)
- `refactor` — A code change that neither fixes a bug nor adds a feature
- `perf` — A code change that improves performance
- `test` — Adding missing tests or correcting existing tests
- `chore` — Changes to the build process or auxiliary tools
- `ci` — Changes to CI configuration files and scripts
- `build` — Changes that affect the build system or external dependencies
- `revert` — Reverts a previous commit

### Rules

- Type must be lowercase
- Subject must not be empty
- Subject must not end with a period
- Header max length: 100 characters
- Body/footer max line length: 100 characters

### Examples

```
feat(quiz): add leaderboard pagination
fix(blog): resolve MDX rendering issue on mobile
refactor(shared): extract cn utility to separate module
test(portfolio): add unit tests for useHeader hook
chore: update dependencies
```

## Pre-commit Hooks

Husky runs on every commit:

1. `bun run lint` — ESLint check
2. `bun test` — All unit tests must pass

Ensure your code passes both before committing.

## Branching

- Never push directly to `main`
- Create feature branches with descriptive names
- Use PR workflow for merging
