# Task Completion Checklist

When completing any development task, follow these steps:

## 1. Code Quality Checks
```bash
pnpm lint         # Check for linting errors
pnpm fix          # Auto-fix what can be fixed
pnpm format:write # Format code with Prettier
```

## 2. Verify Build
```bash
pnpm build        # Ensure production build succeeds
```

## 3. Manual Verification (if applicable)
```bash
pnpm dev          # Test in development mode if needed
```

## 4. Git Workflow
- Stage relevant files: `git add <files>`
- Follow commit message guidelines from .cursorrules
- Format: `prefix: message` (under 50 chars, English, imperative mood)
- Use appropriate prefix: feat, fix, docs, style, refactor, perf, test, chore

## Important Notes
- **Always lint and format** before committing
- **Build must pass** - static export configured
- **Follow React conventions** - arrow functions, prop sorting, etc.
- **No unused imports** - will cause lint failures
- **Commit messages** must follow Angular convention with prefix
