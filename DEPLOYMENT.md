# Deployment & hosting architecture

How the bpdm/ui site is hosted, and how to deploy each piece.

## Site topology

| URL | What | Source | Vercel project |
| --- | --- | --- | --- |
| `bpdm.dev` | Portfolio (personal) | separate repo | `bpdm-portfolio` |
| `ui.bpdm.dev` | Library **front door** — marketing landing + Storybooks | `apps/landing` (+ assembled `/react`, `/angular` Storybooks) | `bpdm-ui` |
| `ui.bpdm.dev/react` | React Storybook (interactive **playground**) | `packages/react` | (part of `bpdm-ui`) |
| `ui.bpdm.dev/angular` | Angular Storybook (interactive **playground**) | `packages/angular` | (part of `bpdm-ui`) |
| **`docs.ui.bpdm.dev`** | **Fumadocs documentation** (primary docs) | `apps/docs` | `bpdm-ui-docs` (its own project) |

### Why `docs.ui.bpdm.dev` and not `docs.bpdm.dev`

`bpdm.dev` is the **portfolio**, so `docs.bpdm.dev` would read as "docs of the
portfolio". The component library lives at `ui.bpdm.dev`, so its docs must sit
**under `ui`** — `docs.ui.bpdm.dev` reads correctly as "docs of ui.bpdm.dev".

`ui.bpdm.dev/docs` (a path) has the cleanest semantics, but the main site is a
**static assembled folder** (landing + Storybooks) while `apps/docs` is a
**dynamic** Next app — putting a dynamic app under a path of the static site
needs a Vercel rewrite/proxy to a second deployment. A nested subdomain avoids
that entirely, so it wins.

### Documentation vs playground (role split)

- **Fumadocs (`apps/docs`) = the documentation.** Getting-started, installation,
  theming, and per-component API + live-usage pages. "Get started" / "Docs" CTAs
  point here. Covers **both React and Angular** from one site.
- **Storybook (`/react`, `/angular`) = the interactive playground.** Secondary;
  linked from inside the docs for "open in Storybook" / prop-tweaking. Not the
  primary docs entry.

The docs app has **no landing of its own** — `apps/docs` `/` redirects to `/docs`
(the marketing landing is the only front door). See `apps/docs/src/app/(home)/page.tsx`.

## Deploying `apps/docs` → `docs.ui.bpdm.dev`

`apps/docs` is a dynamic Next app (SSR + OG images + `llms.txt`), so it deploys as
its **own Vercel project** (do NOT try to bundle it into the static `site/`).

1. **New Vercel project** `bpdm-ui-docs`, import `BDev-9/bpdm-ui`.
2. **Root Directory** = `apps/docs`. Framework preset = **Next.js**.
3. **Build command** (build workspace deps first, from the repo root):
   ```
   cd ../.. && pnpm --filter @bpdm/docs... build
   ```
   (`@bpdm/docs...` builds `@bpdm/tokens`, `@bpdm/variants`, `@bpdm/ui` before docs.)
   Install command: `pnpm install` (run at repo root; monorepo detected).
   > A NEW docs page also needs `pnpm --filter @bpdm/docs exec fumadocs-mdx` to
   > regenerate `.source` before `next build` (edit-only pages don't).
4. **Domain**: add `docs.ui.bpdm.dev` in the project's Domains tab. Because
   `bpdm.dev`'s DNS is already managed on Vercel, the nested subdomain validates
   automatically (a `CNAME` is added for you).
5. Every push to `main` auto-rebuilds.

## Deploying `ui.bpdm.dev` (landing + Storybooks)

Existing `bpdm-ui` project. Build assembles the static site:
```
pnpm build:site   # build-storybook (React + Angular) + landing build + scripts/assemble-site.mjs → site/
```
`site/` is what Vercel serves: landing at `/`, Storybooks at `/react` and `/angular`.

**After `docs.ui.bpdm.dev` is live**, rewire the landing CTAs in
`apps/landing/app/page.tsx` (the `REACT_DOCS` / `ANGULAR_DOCS` constants and the
"Get started" / "Explore" links) to point at `https://docs.ui.bpdm.dev`, and keep
the Storybooks as a separate "Playground" link. (Not done earlier: pointing live
CTAs at a not-yet-live subdomain would 404 the landing.)

## ⚠️ Vercel Hobby is NON-COMMERCIAL

All of these projects run on **Vercel Hobby (free)**.

- **Subdomains/custom domains are free and effectively unlimited** — each is just a
  DNS record; there is no per-subdomain charge. The only recurring cost is the root
  `bpdm.dev` domain registration (already owned). Nested subdomains
  (`docs.ui.bpdm.dev`) are free too.
- **BUT Hobby's Terms of Service allow non-commercial use only.** The moment bpdm/ui
  (or any sibling project) starts **earning money**, that project must move to
  **Vercel Pro** (or another host). Track this before any monetization.
