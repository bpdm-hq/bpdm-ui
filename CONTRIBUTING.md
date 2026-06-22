# Contributing to @bpdm/ui

Thanks for your interest! This guide covers how to set the project up, the
conventions the library follows, and how to add or change a component.

## Prerequisites

- **Node** ≥ 18
- **pnpm** (the repo uses the pnpm lockfile)

## Setup

```bash
pnpm install
pnpm storybook    # interactive docs at http://localhost:6012
```

Useful scripts:

| Command | What it does |
| --- | --- |
| `pnpm storybook` | run the docs/playground locally |
| `pnpm build` | bundle the library with tsup → ESM + CJS + `.d.ts` |
| `pnpm typecheck` | `tsc --noEmit` (strict: `noUnusedLocals` / `noUnusedParameters`) |
| `pnpm build-storybook` | static docs build (what the live site deploys) |

## Project structure

```
src/
  components/            # one file per component (+ a .stories.tsx beside it)
    internal/            # shared, non-exported helpers (icons, trigger variants)
  lib/                   # shared utilities (cn, useControllable)
  styles/tokens.css      # design tokens, themes, keyframes, motion language
  index.ts               # public entry point — every export is the public API
  Introduction.mdx       # Storybook landing page
```

## Conventions

These keep the library consistent and production-grade. Please follow them.

**TypeScript & lint**
- Strict TypeScript; `pnpm typecheck` must pass with no unused locals/params.
- React 19 + function components; `forwardRef` where a ref is useful.

**Styling & theming**
- Tailwind CSS 4 utility classes — no runtime CSS-in-JS.
- **Never hardcode colors.** Use the semantic tokens (`--primary`, `--background`,
  `--muted`, `--success`, …) so all four themes work automatically.
- Variant styling via `class-variance-authority` (`cva`); merge classes with `cn()`.

**Motion language**
- Reuse the shared tokens from `tokens.css` — `--bpdm-ease-out`,
  `--bpdm-ease-overshoot`, `--bpdm-duration-fast | base | slow` — instead of
  hardcoding durations/easings. Keep motion subtle; it must respect
  `prefers-reduced-motion`.

**Accessibility**
- Prefer Radix primitives for interactive components (focus, keyboard, ARIA).
- Provide `role` / `aria-*`, visible focus rings, and keyboard support.

**Reuse**
- Compose existing components for user-facing controls rather than re-implementing
  them; keep small internal affordances raw. Factor shared logic into `lib/` or
  `components/internal/` (don't copy-paste).

## Adding a component

1. Create `src/components/<name>.tsx` and export it from `src/index.ts`.
2. Add `src/components/<name>.stories.tsx`:
   - a `title` under the right group (`Actions`, `Inputs`, `Selection`,
     `Data Display`, `Overlay`, `Feedback`, `Navigation`);
   - `tags: ["autodocs"]`, plus `tags: ["!dev"]` on secondary stories so the
     sidebar shows only a few hero stories (the rest still appear on the Docs page);
   - **every story's `docs.source.code` must be a complete, copy-pasteable example**
     — from its `import` line to the end. No truncated/`…` snippets.
3. **Demo data must be domain-neutral** — use teams/projects/analytics/deploy
   examples, never crypto/finance/transaction data.
4. Run `pnpm typecheck` and check the component in Storybook across all four themes.

## Commits & pull requests

- One concise, lower-case summary line per commit (e.g.
  `feat: Badge + NotificationBadge`, `refactor: share useControllable hook`).
- Keep PRs focused (one component or one concern); make sure `pnpm typecheck` and
  `pnpm build` pass.

## License

By contributing, you agree your contributions are licensed under the project's
[MIT License](./LICENSE).
