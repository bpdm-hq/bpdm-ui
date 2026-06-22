# bpdm/ui

**One design system, every framework.** A modern, themeable, accessible design
system with a warm amber identity, four built-in themes, and one consistent motion
language — implemented natively per framework on top of a single shared set of
design tokens.

**[Live site → ui.bpdm.dev](https://ui.bpdm.dev)** — pick your framework and explore the live docs.

---

## Packages

This is a monorepo (pnpm workspaces + Turborepo). Each framework is its own
published package under the `@bpdm/` scope, all sharing one tokens package — so
developers install only what they use, and every framework looks identical.

| Package | Path | What | Status |
| --- | --- | --- | --- |
| [`@bpdm/tokens`](./packages/tokens) | `packages/tokens` | Framework-agnostic design tokens (CSS variables, themes, motion) — the shared source of truth | ✅ Live |
| [`@bpdm/variants`](./packages/variants) | `packages/variants` | Framework-agnostic styling primitives (`cn` + cva variant maps) — shared class strings | ✅ Live |
| [`@bpdm/ui`](./packages/react) | `packages/react` | **React** components (Radix + Tailwind 4) — 38 components | ✅ Live |
| `@bpdm/ng` | `packages/angular` | **Angular** components (Angular CDK + Tailwind) | 🚧 Coming soon |

Install only the framework you need — both pull in the same shared tokens:

```bash
npm install @bpdm/ui     # React
npm install @bpdm/ng     # Angular (coming soon)
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
| `@bpdm/ng` (Angular) | latest two Angular majors _(set when it ships)_ |

Each package's README has its full compatibility table.

## Local development

Run everything from the repo root — Turborepo fans tasks out to the packages:

```bash
pnpm install
pnpm storybook     # React docs/playground at http://localhost:8100
pnpm build         # build every package (tsup → ESM + CJS + d.ts)
pnpm typecheck     # tsc --noEmit (strict)
pnpm lint          # ESLint across packages
pnpm test          # unit + a11y tests (Vitest)
pnpm build:site    # build Storybooks + assemble the deployed site/ (landing + /react)
```

Scope a command to one package with `pnpm --filter @bpdm/ui <script>`.

## Repo structure

```
packages/
  tokens/                  # @bpdm/tokens — shared design tokens (CSS), source of truth
  variants/                # @bpdm/variants — shared cn + cva variant maps (pure TS)
  react/                   # @bpdm/ui — the React library (see its own README)
landing/                   # framework-picker portal (static index.html)
scripts/assemble-site.mjs  # assembles site/ (landing + each Storybook) for deploy
turbo.json                 # Turborepo task pipeline
pnpm-workspace.yaml        # workspace definition
vercel.json                # builds `pnpm build:site` → serves `site/`
```

The deployed site is assembled by `pnpm build:site`: the landing portal at `/`,
the React Storybook at `/react`, and (once built) the Angular Storybook at `/angular`.

## Contributing

Conventions, project structure, and how to add a component are in
[CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) © [Bhavin P. Devamorari](https://bpdm.dev)
</content>
