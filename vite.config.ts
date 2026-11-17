/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The one place the site's public address comes from (see docs/decisions/0003-site-url.md):
// SITE_URL if set, otherwise the production domain Vercel reports, otherwise the local preview.
const siteUrl = (
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'http://localhost:4173'
).replace(/\/+$/, '')

// scripts/build.mjs sets BUILD_TIME once, so the browser bundle and the prerender agree on "now".
const buildTime = Number(process.env.BUILD_TIME) || Date.now()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __SITE_URL__: JSON.stringify(siteUrl),
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
