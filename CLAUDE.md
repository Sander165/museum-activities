# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

**Next.js 16 App Router** project. All routes live under `app/`. Pages and layouts are Server Components by default.

**Data**: Static JSON in `data/activities.json` — 27 Dutch museum activities. Types are defined in `types/activity.ts` (`Activity`, `ActivityType`, `ActivitiesData`).

**Path alias**: `@/*` maps to the project root (e.g., `@/types/activity`, `@/data/activities.json`).

## Breaking Changes vs. Prior Next.js Versions

**`params` and `searchParams` are Promises** — always `await` them:

```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

**Caching model**: The old `fetch` caching behavior is replaced by the `use cache` directive (requires `cacheComponents: true` in `next.config.ts`). Without it, `fetch` is uncached by default. Wrap uncached fetching components in `<Suspense>` to stream them.

**Instant navigations**: If client-side navigations feel slow, export `unstable_instant` from the route. See `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md`.

Before writing any route, component, or data-fetching code, read the relevant guide under `node_modules/next/dist/docs/`.
