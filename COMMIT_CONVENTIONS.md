# Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This ensures consistent commit history and enables automatic changelog generation.

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries
- **ci**: Changes to CI configuration files and scripts
- **build**: Changes that affect the build system or external dependencies
- **revert**: Reverts a previous commit

## Examples

### Good Commit Messages ✅

```
feat: add user authentication
fix: resolve navigation menu toggle issue
docs: update installation instructions
style: format code with prettier
refactor: simplify header component logic
test: add unit tests for footer component
chore: update dependencies
ci: add GitHub Actions workflow
```

### Bad Commit Messages ❌

```
Update stuff
Fixed bug
Added feature
WIP
asdf
```

## Scope (Optional)

You can add a scope to provide additional context:

```
feat(auth): add login functionality
fix(header): resolve mobile menu toggle
test(components): add header component tests
docs(readme): update setup instructions
```

## Rules

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter of the description
- No dot (.) at the end of the description
- Maximum 100 characters for the header line
- Maximum 100 characters per line in body and footer

## Pre-commit Hooks

This project has pre-commit hooks that will:

1. **Run ESLint** to check code quality
2. **Run tests** to ensure nothing is broken
3. **Validate commit message** format using Commitlint

If any of these checks fail, the commit will be rejected.

## Bypassing Hooks (Not Recommended)

In emergency situations, you can bypass hooks with:

```bash
git commit --no-verify -m "emergency fix"
```

**Note**: This should only be used in exceptional circumstances.
