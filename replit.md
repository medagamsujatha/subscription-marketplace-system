# SubSpace — Subscription Marketplace

## Overview

SubSpace is a full-stack subscription marketplace web application where users can browse, discover, and manage their software subscriptions.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + Vite + Tailwind CSS + shadcn/ui
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Real-time**: WebSocket (`ws` package) at `/ws`
- **Build**: esbuild (CJS bundle)
- **Animation**: framer-motion
- **Icons**: lucide-react
- **Date formatting**: date-fns

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server with WebSocket support
│   └── subspace/           # React + Vite frontend (SubSpace marketplace)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # Database seeding script
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

- **Marketplace** — Browse 14 subscription services across 8 categories with search, category filters, price range filtering, and sorting
- **Service Detail** — Full service info with monthly/annual pricing toggle, features list, subscribe CTA
- **My Subscriptions** — User subscription dashboard with plan details, renewal dates, cancel functionality
- **Categories** — Visual grid of service categories with counts
- **Real-time updates** — WebSocket broadcasts subscription count changes live

## Database Schema

- `categories` — Service categories (streaming, productivity, gaming, health, education, news, security, music)
- `subscription_services` — Marketplace listings with pricing, ratings, features
- `user_subscriptions` — User's active/cancelled subscriptions

## API Endpoints

- `GET /api/healthz` — Health check
- `GET /api/subscriptions` — List services (filters: category, search, minPrice, maxPrice, sortBy)
- `POST /api/subscriptions` — Create a service listing
- `GET /api/subscriptions/:id` — Get service details
- `GET /api/categories` — List categories
- `GET /api/user-subscriptions` — Get user's subscriptions
- `POST /api/user-subscriptions` — Subscribe to a service { serviceId, planType }
- `DELETE /api/user-subscriptions/:id` — Cancel a subscription
- `GET /api/stats` — Marketplace stats
- `WS /ws` — WebSocket endpoint for real-time events

## Development

```bash
# Seed database
pnpm --filter @workspace/scripts run seed

# Run codegen (after OpenAPI spec changes)
pnpm --filter @workspace/api-spec run codegen

# Push DB schema
pnpm --filter @workspace/db run push

# Typecheck
pnpm run typecheck
```
