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
- Dark only. Background zinc-950, surfaces zinc-900, borders zinc-800, body text
  zinc-300, headings zinc-50, one accent (emerald-400) used sparingly.
- Clean 1px borders, rounded-lg cards, small high-contrast badges for tech stacks.
- System font stack for text, monospace for badges, branch names and numbers.
- Sticky top nav with anchor links; smooth scrolling, turned off when
  prefers-reduced-motion is set.
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
