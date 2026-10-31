# tanmay-about

A one-page personal site for Tanmay Surve: what I've shipped, the stack I use, how I work with AI agents, and how this page was built. I made it as part of my application to Fredrin.

Astro, TypeScript (strict) and Tailwind CSS. Static output, no client-side framework, works with JavaScript turned off. Every personal fact lives in [`src/content/profile.ts`](src/content/profile.ts).

## Run it locally

Needs Node.js 22.12 or newer.

```sh
npm ci
npm run dev       # dev server at http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve dist/ at http://localhost:4321
```

Checks, the same ones CI runs on every pull request and push to `main`:

```sh
npm run check     # astro check (types)
npm test          # vitest
npm run build
npx --yes linkinator@8.1.0 dist      # broken links, config in linkinator.config.json
npx --yes @lhci/cli@0.15.1 autorun   # Lighthouse, fails below 95 in any category (needs Chrome)
```

Pushes to `main` that pass these checks deploy to Cloudflare Pages ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

Built with Fredrin, through tickets and pull requests.
