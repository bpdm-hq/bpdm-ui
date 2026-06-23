# @bpdm/ui

A modern, themeable, accessible **React component library** — **38 components** built
on Radix primitives and Tailwind CSS 4, with a warm amber design system, four
built-in themes (light & dark), and one consistent motion language.

[![npm version](https://img.shields.io/npm/v/@bpdm/ui.svg)](https://www.npmjs.com/package/@bpdm/ui)
[![license](https://img.shields.io/npm/l/@bpdm/ui.svg)](./LICENSE)
[![types](https://img.shields.io/npm/types/@bpdm/ui.svg)](#)

**[Live demo & docs → ui.bpdm.dev](https://ui.bpdm.dev)** — interactive Storybook with every component, variant, and theme.

> The React implementation of the **bpdm design system**. One set of design tokens,
> built for every framework — see the [monorepo overview](https://github.com/BDev-9/bpdm-ui).

---

## Features

- **38 components** across forms, selection, data display, overlays, feedback, and navigation.
- **Accessible by default** — keyboard, focus, and ARIA handled via Radix primitives (`role`, `aria-*`, roving focus).
- **Themeable** — every component reads semantic CSS variables; switch the whole UI with one `data-theme` attribute, or override variables to match your brand.
- **Four built-in themes** — `paper` & `mist` (light), `charcoal` & `slate` (dark).
- **One motion language** — shared easing/duration tokens drive every transition; honors `prefers-reduced-motion`.
- **Typed** — full TypeScript types and prop-level autocomplete.
- **Tree-shakeable** — ESM + CJS, `sideEffects: false`; only what you import ships.
- **Light footprint** — Tailwind class strings, no runtime CSS-in-JS.

## Install

```bash
pnpm add @bpdm/ui
# peers: react ^18 || ^19, react-dom ^18 || ^19, and tailwindcss ^4
```

## Compatibility

| Dependency | Supported | Notes |
| --- | --- | --- |
| **React** / react-dom | **18.x · 19.x** | declared as a peer (`^18 \|\| ^19`) |
| **Tailwind CSS** | **4.x** _(required)_ | the tokens use Tailwind 4 syntax (`@theme inline`, custom variants); declared as a peer |
| **TypeScript** | 5.x or newer | optional — full types ship with the package |
| **Node** | ≥ 20 | for local development only; the package itself is browser code |

**Support policy:** we support the **current and previous major** of React (today: 18 & 19). Older majors are best-effort and may be dropped in a minor release, always noted in the changelog. Tailwind CSS **4 is required** — the design tokens won't compile on Tailwind 3.

## Setup

`@bpdm/ui` ships Tailwind class names, so your app's Tailwind generates the styles.
In your global CSS:

```css
@import "tailwindcss";
@import "@bpdm/ui/styles.css";                  /* design tokens + themes */
@source "../node_modules/@bpdm/ui/dist";        /* the components */
@source "../node_modules/@bpdm/variants/dist";  /* the shared variant classes */
```

Pick a theme on any ancestor (default is `paper`):

```html
<html data-theme="paper">    <!-- light · warm (default) -->
<html data-theme="mist">     <!-- light · cool -->
<html data-theme="charcoal"> <!-- dark · warm -->
<html data-theme="slate">    <!-- dark · cool, enterprise -->
```

## Usage

```tsx
import { Button, Input, Checkbox } from "@bpdm/ui";

export function Example() {
  return (
    <form className="space-y-3">
      <Input placeholder="you@company.com" type="email" />
      <label className="flex items-center gap-2">
        <Checkbox /> Remember me
      </label>
      <Button>Sign in</Button>
    </form>
  );
}
```

Import from the package root, or deep-import a single component by its file name —
both are tree-shakeable; the per-component subpath guarantees only that module is pulled in:

```tsx
import { Button } from "@bpdm/ui";            // barrel (tree-shaken)
import { Button } from "@bpdm/ui/button";     // single component
import { DatePicker } from "@bpdm/ui/calendar";
```

## Components

**Actions** — `Button`

**Inputs** — `Input` · `Textarea` · `NumberInput` · `MoneyInput` · `PasswordInput` · `SecureField` · `InputOtp` · `FloatLabel` · `DatePicker`

**Selection** — `Checkbox` · `RadioGroup` · `Switch` · `Select` · `MultiSelect` · `TreeSelect`

**Data Display** — `Card` · `Avatar` · `Badge` · `StatCard` · `StatusTimeline` · `DataTable` · `OrderList` · `PickList`

**Overlay** — `Dialog` · `Drawer` · `Popover` · `Tooltip` · `ConfirmDialog` · `DynamicDialog` · `StepDialog`

**Feedback** — `Toast` · `Alert` · `Spinner` · `ProgressBar`

**Navigation** — `Tabs` · `Accordion` · `Stepper`

A few highlights:

| Component | Highlights |
| --- | --- |
| `DataTable` | sorting, multi-select, paging (client / server / cursor), column pinning + reorder, filters, frozen columns, virtualization, responsive card mode |
| `DatePicker` | single & range, multi-month, month/year dropdowns, configurable presets, min/max + disabled days — zero date-lib dependency |
| `Select` / `MultiSelect` / `TreeSelect` | virtualized (10k+ rows), searchable, grouped, chips with overflow |
| `NumberInput` / `MoneyInput` | precision-safe (string + bignumber.js), no float drift |
| `Toast` | imperative `toast()` API, `toast.promise()`, swipe-to-dismiss, six positions |
| `Stepper` | horizontal / vertical, linear + validation gating, lock indicator |
| `OrderList` / `PickList` | select & reorder / transfer between lists, drag-and-drop |

> Every component has live examples and copy-pasteable code on **[ui.bpdm.dev](https://ui.bpdm.dev)**.

## Theming

Components never hardcode colors — they read CSS variables (`--primary`,
`--background`, …). Re-brand by overriding those variables, globally or scoped:

```css
:root {
  --primary: #7c3aed;          /* your brand color     */
  --ring: #7c3aed;             /* matching focus ring  */
  --primary-foreground: #fff;  /* text on primary      */
}
```

A starter theme template (with the full required/optional variable reference) is on
the **Theming → Custom Theme Template** page in the docs.

## Local development

This package lives in the [bpdm-ui monorepo](https://github.com/BDev-9/bpdm-ui).
From the repo root:

```bash
pnpm install
pnpm storybook   # interactive docs at http://localhost:8100
pnpm build       # bundle the library (tsup → ESM + CJS + d.ts)
pnpm typecheck   # tsc --noEmit
```

Or scope a command to this package directly with `pnpm --filter @bpdm/ui <script>`.

## Contributing

Conventions, project structure, and how to add a component are in
[CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[MIT](./LICENSE) © [Bhavin P. Devamorari](https://bpdm.dev)
</content>
</invoke>
