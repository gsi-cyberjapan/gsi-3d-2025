# Project Overview: gsi-3d-2025

## Purpose
This is a Next.js project (version 16.0.0) initialized for building a web application. The project appears to be in its initial setup phase, focused on a potential 3D/GSI (possibly Gaussian Splatting or similar 3D rendering) application based on the project name.

## Tech Stack
- **Framework**: Next.js 16.0.0 (with App Router)
- **React**: Version 19.2.0
- **TypeScript**: Version 5
- **Styling**: Tailwind CSS v4
- **Package Manager**: pnpm (based on pnpm-lock.yaml)
- **Node.js Runtime**: Target ES2017

## Key Features & Configuration
- **Static Export**: Configured with `output: "export"` in next.config.ts
- **React Compiler**: Enabled (babel-plugin-react-compiler)
- **Font Optimization**: Uses Geist Sans and Geist Mono fonts
- **Path Aliases**: `@/*` mapped to `./src/*`

## Project Structure
```
/
├── src/
│   └── app/              # Next.js App Router pages
│       ├── layout.tsx    # Root layout with metadata & fonts
│       ├── page.tsx      # Home page component
│       ├── globals.css   # Global styles
│       └── favicon.ico
├── public/               # Static assets
├── node_modules/
├── .next/               # Next.js build output
└── [config files]
```

## Development Environment
- **OS**: Linux (WSL2)
- **Branch**: Currently on `issue/1` branch
- **Main Branch**: Not yet defined in git
