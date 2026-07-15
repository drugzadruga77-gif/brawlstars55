# Brawl Stars Статистика

A Russian-language web app for looking up Brawl Stars players by tag and viewing their profile, brawler collection, and recent battles.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/brawl-stats run dev` — run the frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required secret: `BRAWL_STARS_API_KEY` — official Brawl Stars API token (IP-locked; see `.agents/memory/brawl-stats-api.md`)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5, proxies the official Brawl Stars API and Brawlify CDN images
- Frontend: React + Vite, wouter routing, TanStack Query, Tailwind, shadcn/radix components
- Validation: Zod (`zod/v4`)
- API codegen: Orval (from OpenAPI spec)
- No database is used — the app is a stateless lookup/proxy over the Brawl Stars API

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for `/players/:tag`, `/players/:tag/battlelog`, `/players/:tag/today`
- `artifacts/api-server/src/lib/brawlApi.ts` — Brawl Stars API client (auth, tag normalization, error mapping)
- `artifacts/api-server/src/lib/brawlMapper.ts` — maps raw API responses to app schemas, computes "today" stats
- `artifacts/api-server/src/routes/players.ts` — player/battlelog/today endpoints
- `artifacts/api-server/src/routes/images.ts` — proxies Brawlify profile-icon/brawler images
- `artifacts/brawl-stats/src/pages/` — `home.tsx` (search), `player.tsx` (profile/brawlers/battles tabs)

## Architecture decisions

- Images are proxied server-side through `/api/images/...` rather than hotlinked from the client, since some networks block the Brawlify CDN client-side.
- "Today's stats" is a best-effort aggregate over whatever battles the Brawl Stars API still exposes (~last 25), not a true daily total — the API has no per-day history endpoint.
- UI copy is in Russian; keep new user-facing strings consistent with that.

## Product

- Search any player by tag on the home page.
- Player page shows profile summary (trophies, club, level), a searchable brawler collection grid (power, rank, gadgets/star powers/gears/hypercharges), today's stats, and recent battle history with per-team results.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- See `.agents/memory/brawl-stats-api.md` for Brawl Stars API quirks (IP-locked keys, tag encoding, timestamp format, battle log limits).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
