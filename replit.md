# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Main app: **Baliarda - Control de Defectos de Blisters** — a pharmaceutical blister defect tracking system for Baliarda laboratory quality control staff.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Excel export**: ExcelJS

## App Structure

### Pages
- `/` — Home: Baliarda logo, 3 action buttons (Cargar Defecto, Defectos Observados, Estadísticas)
- `/cargar-defecto` — Load Defect form: OP#, Bulk Code, Product, Lot, blister calculation, defect type selection, camera photo capture (label photo + defect photos), incidence rate auto-calculation
- `/defectos-observados` — Defects list: filter by date range and defect type, view all records with photos, delete, Excel export
- `/estadisticas` — Statistics: bar chart by defect type, line chart over time, summary cards

### Defect Types
arrugas, pisados, codificado_cortado, codificado_poco_legible, blisters_vacio, blisters_ausencia_comprimido, blisters_comprimido_partido, poco_segrinado, polvo, manchas, pinchados

### API Routes
- GET /api/defects — list with optional filters (fromDate, toDate, defectType)
- POST /api/defects — create defect record
- GET /api/defects/:id — get single defect
- DELETE /api/defects/:id — delete defect
- GET /api/defects/stats/summary — statistics summary
- GET /api/defects/export/excel — Excel file download
- POST /api/photos — upload base64 photo, returns URL
- GET /api/uploads/:filename — serve uploaded photos

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
