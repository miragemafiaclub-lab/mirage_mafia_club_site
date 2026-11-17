# 0003. The site address is one setting, not written into the code

Date: 2026-11-17 · Status: accepted

## Decision
Absolute links (canonical, hreflang, Open Graph images, sitemap) are built from `SITE_URL` in
`src/site.ts`, which `vite.config.ts` fills at build time from, in order:
1. the `SITE_URL` environment variable (set it in Vercel → Settings → Environment Variables);
2. `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel provides automatically — the production domain,
   so connecting our own domain later updates every link without code changes;
3. `http://localhost:4173` for local builds.

## Consequences
Preview deployments point canonical links at production, which is what search engines expect.
