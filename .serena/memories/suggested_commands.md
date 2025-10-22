# Suggested Commands for gsi-3d-2025

## Development Commands

### Running the Application
```bash
pnpm dev          # Start development server (http://localhost:3000)
pnpm build        # Build for production
pnpm start        # Start production server
```

### Code Quality Commands
```bash
pnpm lint         # Run ESLint on src directory
pnpm fix          # Auto-fix ESLint issues
pnpm format       # Check formatting with Prettier
pnpm format:write # Auto-format code with Prettier
```

## System Commands (Linux/WSL2)
Standard Linux commands are available:
- `ls`, `cd`, `pwd` - File navigation
- `grep`, `find` - Text/file search
- `git` - Version control
- `cat`, `head`, `tail` - File viewing

## Workflow After Task Completion
1. **Lint**: Run `pnpm lint` to check for code issues
2. **Fix**: Run `pnpm fix` to auto-fix linting issues
3. **Format**: Run `pnpm format:write` to format code
4. **Build**: Run `pnpm build` to ensure production build works
5. **Commit**: Follow commit message guidelines (see code_style_and_conventions.md)
