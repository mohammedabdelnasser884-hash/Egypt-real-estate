# عقار ثقة — Aqar Thiqa

منصة عقارية مصرية عربية أولاً، تربط الباحثين بعقارات ومكاتب موثقة مع البحث والحفظ والمقارنة والطلبات.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed:estate` — seed the local database with non-authenticated demo data
- Required env: `DATABASE_URL` and `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/estate` — React + Vite Arabic-first web application
- `artifacts/api-server` — Express API and route composition
- `lib/db/src/schema` — Drizzle database schema source of truth
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/api-client-react` — generated React Query hooks and schemas
- `artifacts/estate/src/index.css` — application theme tokens and global styles
- `scripts/src/seed-estate.ts` — local demo data seed

## Architecture decisions

- The web app and API are separate artifacts; the API is exposed through the `/api` proxy path.
- OpenAPI-generated web client URLs already include `/api`; do not call `setBaseUrl('/api')` in the web app or requests will become `/api/api/...`.
- Replit Auth is used for real sessions; seeded demo users provide related data for local browsing but cannot log in.
- Governorates and cities are served from a static API endpoint rather than stored as database rows.

## Product

- Verified property browsing across sale and rent listings in Egypt
- Office profiles with verification, contact actions, and office listings
- Search filters, saved searches, favorites, comparisons, property requests, notifications, and reports
- Arabic-first responsive layout optimized for mobile and trust-focused discovery

## User preferences

No additional user preferences recorded.

## Gotchas

- Rebuild `lib/db` declarations with `tsc -b .` after schema changes before typechecking dependent packages.
- If OpenAPI schemas or paths change, regenerate the API client and verify the generated URLs still target `/api`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details