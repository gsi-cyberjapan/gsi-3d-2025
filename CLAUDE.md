# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a 3D map visualization application built with Next.js 16 (App Router), React 19, MapLibre GL, and TerraDraw. The application allows users to view GSI (Geospatial Information Authority of Japan) maps with multiple layout modes, draw features on maps, and search for locations using Japanese address geocoding.

## Development Commands

```bash
# Development server
pnpm dev

# Build for production (static export)
pnpm build

# Serve production build locally
pnpm start

# Linting
pnpm lint

# Auto-fix linting and formatting issues
pnpm fix

# Check formatting
pnpm format
```

**Package Manager:** This project uses `pnpm` (version 10.13.1). Always use `pnpm` for package management.

**Node Version:** 24.4.1 (managed via Volta)

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

Uses two services:
1. `@geolonia/normalize-japanese-addresses` for local normalization
2. CSIS Simple Geocoding Service for lat/lng lookup
3. GSI MUNI master data for municipality codes

Implementation: `src/lib/geocode.ts`

## Code Conventions

### Git Commit Messages

From `.cursorrules`:
- Always use Angular convention prefixes: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `chore:`
- Keep message under 50 characters INCLUDING the prefix
- Use imperative mood (e.g., "add feature" not "added feature")
- No periods at the end
- Always use English

### TypeScript

- Path alias: `@/*` maps to `./src/*`
- Strict mode enabled
- Target ES2017
- React 19 JSX transform (`jsx: "react-jsx"`)

### UI Components

- Uses Radix UI primitives with custom styling
- Tailwind CSS 4 with `@tailwindcss/postcss`
- Theme system via `next-themes`
- Component library in `src/components/ui/`

## Important Implementation Details

### MapLibre GL Protocol Registration

MapLibre GL and PMTiles protocol must be loaded asynchronously and cached. See `src/lib/getMaplibreWhithProtocol.ts` for the singleton pattern used to ensure protocol is only registered once.

## Testing & Quality

The project uses:
- ESLint with Next.js config, Prettier integration, and unused imports plugin
- React Query plugin for proper query usage
- TypeScript strict mode for type safety
