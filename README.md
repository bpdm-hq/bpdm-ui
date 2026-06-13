# @bpdm/ui

A modern, themeable, accessible **React component library** — built on Radix
primitives and Tailwind CSS 4, with a warm amber design system and four built-in
themes (light & dark).

[![npm version](https://img.shields.io/npm/v/@bpdm/ui.svg)](https://www.npmjs.com/package/@bpdm/ui)
[![license](https://img.shields.io/npm/l/@bpdm/ui.svg)](./LICENSE)
[![types](https://img.shields.io/npm/types/@bpdm/ui.svg)](#)

---

## Features

- **Accessible by default** — keyboard, focus, and ARIA handled via Radix primitives.
- **Themeable** — every component reads semantic CSS variables; switch the whole UI
  with one `data-theme` attribute, or override variables to match your brand.
- **Four built-in themes** — `paper` & `mist` (light), `charcoal` & `slate` (dark).
- **Typed** — full TypeScript types and prop-level autocomplete.
- **Tree-shakeable** — ESM + CJS, `sideEffects: false`, only what you import ships.
- **Tiny surface** — Tailwind class strings, no runtime CSS-in-JS.

## Install

```bash
pnpm add @bpdm/ui
# peers: react >= 18, react-dom >= 18 — and Tailwind CSS 4 in your app
```

## Setup

`@bpdm/ui` ships Tailwind class names, so your app's Tailwind generates the styles.
In your global CSS:

```css
@import "tailwindcss";
@import "@bpdm/ui/styles.css";              /* design tokens + themes */
@source "../node_modules/@bpdm/ui/dist";    /* let Tailwind scan the components */
```

Pick a theme on any ancestor (default is `paper`):

```html
<html data-theme="paper">   <!-- light · warm (default) -->
<html data-theme="mist">    <!-- light · cool -->
<html data-theme="charcoal"><!-- dark · warm -->
<html data-theme="slate">   <!-- dark · cool, enterprise -->
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

## Components

| Component | Highlights |
| --- | --- |
| `Button` | variants (primary/secondary/outline/ghost/destructive), sizes, icon-only, round/pill, `asChild` |
| `Input` | sizes, outline/underline, start/end icons, invalid state |
| `NumberInput` | precision-safe stepper (string + bignumber.js), stacked/horizontal, min/max, prefix/suffix |
| `FloatLabel` | floating label wrapper — over / in / on variants |
| `InputOtp` | one-time-code — auto-advance, paste, mask, grouping |
| `Checkbox` | checked / indeterminate, sizes, invalid |
| `RadioGroup` | single-select, sizes, horizontal/vertical, invalid |
| `Switch` | pill/square/sharp shapes, optional icon thumb, sizes |

## Theming

Components never hardcode colors — they read CSS variables (`--primary`,
`--background`, …). Re-brand by overriding those variables, globally or scoped:

```css
:root {
  --primary: #7c3aed;          /* your brand color    */
  --ring: #7c3aed;             /* matching focus ring  */
  --primary-foreground: #fff;  /* text on primary      */
}
```

A starter `bpdm-theme.css` (with the full required/optional variable reference) is
downloadable from the **Theming → Custom Theme Template** page in Storybook.

## Documentation

Run the interactive component explorer locally:

```bash
pnpm install
pnpm storybook   # http://localhost:6003
```

## License

[MIT](./LICENSE) © [Bhavin P. Devamorari](https://bpdm.dev)
