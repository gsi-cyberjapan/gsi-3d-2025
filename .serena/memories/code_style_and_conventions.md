# Code Style and Conventions

## TypeScript Configuration
- **Target**: ES2017
- **Strict Mode**: Enabled
- **Module System**: ESNext with bundler resolution
- **JSX**: react-jsx (React 19 automatic runtime)

## React Conventions (Enforced by ESLint)
- **Component Definition**: Use arrow functions for all components
  ```tsx
  const MyComponent = () => { ... }
  ```
- **Destructuring**: Must destructure props (`react/destructuring-assignment`)
- **JSX Rules**:
  - Use boolean shorthand: `<Component enabled />` not `<Component enabled={true} />`
  - Use fragments: `<>...</>` not `<React.Fragment>`
  - Avoid unnecessary curly braces
  - Remove useless fragments
  - Sort props alphabetically
  - Self-close components without children
  - Use PascalCase for component names
- **No dangerouslySetInnerHTML**: Forbidden (`react/no-danger`)
- **Hooks**: Exhaustive deps required

## Import Management
- **Unused Imports**: Automatically removed (unused-imports plugin)
- **Unused Variables**: Variables starting with `_` are allowed

## Code Organization
- **Interface/Object Sorting**: Properties should be sorted (perfectionist plugin, warning level)
- **Path Aliases**: Use `@/` for imports from `src/` directory
  ```tsx
  import { Component } from '@/components/Component'
  ```

## Git Commit Message Guidelines
**Format**: `prefix: message` (always in English)

**Prefixes** (Angular Convention):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code formatting (no meaning change)
- `refactor:` - Code restructuring
- `perf:` - Performance improvements
- `test:` - Test additions/fixes
- `chore:` - Build/tooling changes

**Rules**:
- Keep message under 50 characters INCLUDING prefix
- Use imperative mood ("add" not "added")
- Be specific but concise
- No periods at the end
- Always in English

## Naming Conventions
- **Components**: PascalCase arrow functions
- **Files**: Use `.tsx` for components, `.ts` for utilities
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE (inferred from TypeScript conventions)
