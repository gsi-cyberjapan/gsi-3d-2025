# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a 3D map visualization application built with Next.js 16 (App Router), React 19, MapLibre GL, and TerraDraw. The application allows users to view GSI (Geospatial Information Authority of Japan) maps with multiple layout modes, draw features on maps, and search for locations using Japanese address geocoding.

## Development Commands

```bash
pnpm dev       # Development server
pnpm build     # Build for production (static export)
pnpm lint      # Linting
pnpm fix       # Auto-fix linting and formatting issues
pnpm format    # Check formatting
```

**Package Manager:** `pnpm` (10.13.1) | **Node:** 24.4.1 (Volta)

## Code Quality Requirements

### CRITICAL RULES - YOU MUST FOLLOW THESE

#### ❌ eslint-disable is PROHIBITED

Never use `eslint-disable` comments in any form. If ESLint reports an error, fix the underlying issue instead of disabling the rule.

#### ✅ Always Verify After Implementation

After making any code changes, you **MUST** run these commands and ensure they all succeed:

```bash
pnpm lint      # Must pass with no errors
pnpm build     # Must complete successfully
pnpm format    # Must pass with no formatting issues
```

**Never skip this verification step.** If any command fails, fix the issues before considering the task complete.

#### ✅ React Best Practices

**Avoid Unnecessary `useEffect` Hooks:**
- Don't use `useEffect` to synchronize state that can be derived
- Prefer derived state from props or store values
- Use `useEffect` only for true side effects (subscriptions, API calls, etc.)
- Always specify dependency arrays for `useEffect`, `useMemo`, `useCallback`

#### ✅ Follow Existing Patterns

**Read Before Writing:**
- Always read existing code in the same area before implementing new features
- Understand the established patterns and conventions
- Match the style and structure of existing code

**Naming Conventions:**
- Components: PascalCase (e.g., `DrawController.tsx`)
- Utilities/Hooks: camelCase (e.g., `useStore.ts`, `geocode.ts`)
- Types/Interfaces: PascalCase (e.g., `MapId`, `DrawMode`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `BASE_LAYER_CONFIG`)

**Coding Style:**
- Arrow function components: `export const ComponentName = () => { ... }`
- Props destructuring required
- Self-closing tags when no children: `<Component />`
- Boolean props without values: `<Button disabled />`
- Use `"use client"` directive for client components
- Import path alias: Use `@/` instead of relative paths when possible

## Architecture

### State Management (Zustand Slices Pattern)

The application uses Zustand with a **slice pattern** where global state is composed of multiple domain-specific slices. All slices are combined in `src/hooks/store/useStore.ts`:

- **`mapManagerState.ts`**: Layout modes (`single`, `split`, `overlay`), active map IDs (`main`, `sub`), position sync, and UI settings
- **`mapState.ts`**: Per-map state including base layers, optional layers, projection mode (`mercator` or `globe`), and TerraDraw instances
- **`drawState.ts`**: Drawing mode selection, draw window visibility, and editing feature IDs
- **`geocodingState.ts`**: Search/geocoding state

**Key Pattern:** Map-specific state is stored in `maps: Record<MapId, MapState>` where `MapId` is either `"main"` or `"sub"`. Always use the map ID when accessing or updating map state.

### Map Components Architecture

Maps are rendered using `react-map-gl/maplibre` with a controller pattern:

- **`<Map />`** (`src/components/map/map.tsx`): Main map container that dynamically loads MapLibre GL and PMTiles protocol
- **Controllers** are child components that use `useMap()` hook to access the map instance:
  - `<DrawController />`: Initializes TerraDraw instance and manages drawing modes
  - `<ZoomLevelController />`: Manages zoom constraints based on projection mode
  - `<PositionSyncController />`: Syncs position between main and sub maps
  - `<OptionalLayers />`: Dynamically adds optional tile layers to maps
  - `<SearchResultController />`: Handles search result markers

**Important:** TerraDraw instances are initialized once per map in `DrawController` and stored in the Zustand store. Never initialize TerraDraw twice for the same map ID - the `setTerraDraw` action will throw an error if you attempt this.

### Layer System

**Base Layers** (`src/lib/getBaseLayers.ts`):
- Configured in `src/lib/config.ts` under `BASE_LAYER_CONFIG`
- Two types: `vector` (uses style JSON) and `raster` (uses tile URLs)
- Style is built dynamically via `buildStyleFromBaseLayer()`

**Optional Layers** (`src/lib/getOptionalLayers.ts`):
- Fetched from GSI's remote layer definitions
- Supports nested layer groups and lazy-loading via `src` references
- Recursively processes layer tree structure

### Next.js Configuration

- **Static Export**: `output: "export"` in `next.config.ts` - this is a static site with no server-side rendering at runtime
- **Route Groups**: Main map page is in `src/app/(map)/page.tsx` using route group `(map)`
- **Client Components**: All map-related components must use `"use client"` directive
- **Dynamic Imports**: MapLibre GL is loaded via `dynamic()` with `ssr: false` to prevent SSR issues

### Japanese Address Geocoding

Uses `@geolonia/normalize-japanese-addresses`, CSIS Simple Geocoding Service, and GSI MUNI data. Implementation: `src/lib/geocode.ts`

## Code Conventions

### Git Commit Messages

From `.cursorrules` - Always use Angular convention:
- **Prefixes:** `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `chore:`
- **Length:** Under 50 characters INCLUDING the prefix
- **Mood:** Imperative (e.g., "add feature" not "added feature")
- **Ending:** No periods at the end
- **Language:** Always use English

### TypeScript

- Path alias: `@/*` → `./src/*`, Strict mode, ES2017, React 19 JSX transform

## Important Implementation Details

### MapLibre GL Protocol Registration

MapLibre GL and PMTiles protocol must be loaded asynchronously and cached. See `src/lib/getMaplibreWhithProtocol.ts` for the singleton pattern used to ensure protocol is only registered once.
