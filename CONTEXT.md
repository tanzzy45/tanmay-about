# Project Context: tanmay-about

## What this is
A one-page personal site for Tanmay Surve, built as a job application to Fredrin
(forward deployed engineer role). The readers are Fredrin's founders. They will read
the code and the PRs, not just the page.

## Stack
- Astro (latest) + TypeScript strict + Tailwind CSS. No React/Vue unless a ticket asks.
- Node 20+, npm. Tests with vitest.
- Static output, hosted on Cloudflare Pages, deployed from main.

## Layout
- src/content/profile.ts: every personal fact (name, links, projects, stack).
  Single source of truth. Never hardcode facts inside components.
- src/components/: one component per page section.
- src/lib/: data fetching (GitHub API).
- content/field-report.md: written by Tanmay. Agents may style it, never rewrite or
  add to it.

## Design
- Dark only, warm stone greys (never zinc). Background stone-950, surfaces stone-900,
  borders stone-800, body text stone-300, muted text stone-400, headings stone-50.
- One accent, cricket-ball red `#f0464a` (`accent` in src/styles/global.css; 5.3:1 on
  stone-950, 4.7:1 on stone-900). Use it only for the main button (stone-950 label,
  `accent-hover` on hover), link hover (the underline turns red) and focus rings.
  Nothing else is red or green: CI badges are neutral, except "CI failed" in red-300.
- Fonts, self-hosted with @fontsource (latin subset, imported in src/layouts/Base.astro).
  No Google Fonts requests.
  - Instrument Serif: the name and section headings. h1 and h2 get it by default
    (global.css). It has one weight, so never bold it.
  - IBM Plex Sans (400/500/600): body text, card titles, buttons.
  - IBM Plex Mono (400/500): badges, branch names and numbers.
  - Preload only the hero font (Instrument Serif).
- Hero: photo to the left of the name from `sm` up, above it on mobile. Headline, intro
  and buttons run full width below.
- Clean 1px borders, rounded-lg cards, small high-contrast badges for tech stacks.
- Sticky top nav with a solid background and anchor links; smooth scrolling, turned
  off when prefers-reduced-motion is set.
- Footer on every page: "Built in Mumbai with Fredrin · Last deployed {build date}",
  the date `astro build` ran, in Mumbai time.
- Favicon: public/favicon.svg, "TS" in the accent on a stone-950 tile (glyph outlines,
  so it needs no font).
- No animations, gradients, glass effects (blur, translucency), emoji or
  decorative icons.
- Mobile first. Must look right at 375px and 1440px.

## Rules
- Never invent facts, numbers, employers or links. If something is missing, leave a
  TODO and list it in the PR description.
- The page must work with JavaScript turned off. Ship less than 10 kB of JS.
- Lighthouse 95+ in all four categories. Semantic HTML, alt text, visible focus
  states, AA contrast.
- Before opening a PR run: npm run check && npm test && npm run build. All must pass.
- One ticket = one branch = one PR. Keep PRs small.
- PR description: what changed, how you tested it, anything you were unsure about.
- Don't edit files outside your ticket's scope. If you must, explain why in the PR.

## Copy style
Plain, specific, short. Numbers over adjectives. Never use "passionate", "obsessed",
"high-agency", "rockstar", "leveraging", "cutting-edge".
