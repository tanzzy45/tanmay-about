// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Static output (Astro's default), deployed to Cloudflare Pages.
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
