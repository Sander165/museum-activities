# 01 — Layout & Header

## Purpose

Page shell + intro that sets context for the calendar.

## Content (from wireframe)

- Title: **Activiteiten & Workshops**
- Intro: "Ontdek ons aanbod aan rondleidingen, workshops en lezingen. Bekijk wat er binnenkort op het programma staat en reserveer direct een plek."

## Structure

- `app/layout.tsx`: update `lang="nl"`, set real `metadata` (title/description), keep fonts + globals.
- `app/page.tsx` (Server Component): load activities, render `<main>` with `<ActivityBrowser>`.
- `Header` component: semantic `<header>` with `<h1>` + intro `<p>`.

## Styling

- Centered content column with max-width + horizontal padding.
- Define design tokens in `globals.css` (colors, spacing scale, radius, type scale) for reuse.
- Mobile-first; comfortable spacing/hierarchy.

## Done when

- Page renders header + intro, responsive, no placeholder boilerplate left.
