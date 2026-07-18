# bpdm/ui

**One design system, every framework.** A modern, themeable, accessible design
system with a warm amber identity, four built-in themes, and one consistent motion
language — implemented natively per framework on top of a single shared set of
design tokens, so React and Angular look and behave identically.

- **Live site → [ui.bpdm.dev](https://ui.bpdm.dev)** — landing + framework picker
- **Docs → [docs.ui.bpdm.dev](https://docs.ui.bpdm.dev)** — full documentation (per-component pages, live previews, theming, i18n)

---

## Packages

This is a monorepo (pnpm workspaces + Turborepo). Each framework is its own
published package under the `@bpdm/` scope, all sharing one tokens package — so
developers install only what they use, and every framework looks identical.

| Package | Path | What | Status |
| --- | --- | --- | --- |
| [`@bpdm/tokens`](./packages/tokens) | `packages/tokens` | Framework-agnostic design tokens (CSS variables, four themes, motion) — the shared source of truth | ✅ Live |
| [`@bpdm/variants`](./packages/variants) | `packages/variants` | Framework-agnostic styling primitives (`cn` + cva variant maps) — shared class strings | ✅ Live |
| [`@bpdm/ui`](./packages/react) | `packages/react` | **React** components (Radix + Tailwind 4) — 38 components | ✅ Live |
| [`@bpdm/ng`](./packages/angular) | `packages/angular` | **Angular** components (standalone + Angular CDK + Tailwind 4) — 38 components, full parity with React | ✅ Live |

Install only the framework you need — both pull in the same shared tokens:

```bash
npm install @bpdm/ui     # React
npm install @bpdm/ng     # Angular
```

> There is no single "install both frameworks" package — that would ship code and
> peer dependencies you don't use. Separate scoped packages sharing `@bpdm/tokens`
> is the standard, lighter approach.

## Compatibility

Every package **requires Tailwind CSS 4** (the design tokens use Tailwind 4 syntax).
Framework support follows a **current + previous major** policy — older majors are
best-effort and only dropped in a minor release, noted in the changelog.

| Package | Framework support |
| --- | --- |
| `@bpdm/ui` (React) | React **18.x · 19.x** |
| `@bpdm/ng` (Angular) | Angular **21.x** |

Each package's README has its full compatibility table.

## Local development

Everything runs from the repo root — Turborepo fans tasks out to the workspaces.
There is no root `dev` script; run an app or package directly with `--filter`.

```bash
pnpm install

# apps
pnpm --filter @bpdm/docs dev        # docs site       → http://localhost:8190
pnpm --filter @bpdm/landing dev     # landing         → http://localhost:8109

# React component playground (Storybook)
pnpm storybook                      # @bpdm/ui stories → http://localhost:8100

# repo-wide tasks (affected-scoped by Turborepo)
pnpm build          # build every package (tsup → ESM + CJS + d.ts; ng-packagr for Angular)
pnpm typecheck      # tsc --noEmit (strict)
pnpm lint           # ESLint across packages
pnpm test           # unit + a11y tests (Vitest)
```

Scope any command to one workspace with `pnpm --filter <name> <script>`
(e.g. `pnpm --filter @bpdm/ui test`).

## Repo structure

```
apps/
  docs/          # @bpdm/docs — Fumadocs documentation site (docs.ui.bpdm.dev)
  landing/       # @bpdm/landing — marketing landing + framework picker (ui.bpdm.dev)
packages/
  tokens/        # @bpdm/tokens — shared design tokens (CSS), source of truth
  variants/      # @bpdm/variants — shared cn + cva variant maps (pure TS)
  react/         # @bpdm/ui — the React library (see its own README)
  angular/       # @bpdm/ng — the Angular library (see its own README)
turbo.json         # Turborepo task pipeline
pnpm-workspace.yaml # workspace definition
```

Each app deploys as its own project: **`apps/landing` → ui.bpdm.dev** and
**`apps/docs` → docs.ui.bpdm.dev**.

## Contributing

Conventions, project structure, and how to add a component are in
[CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) © [Bhavin P. Devamorari](https://bpdm.dev)
