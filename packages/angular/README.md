# @bpdm/ng

A modern, themeable, accessible **Angular component library** — standalone
components/directives built on Angular CDK and Tailwind CSS 4, with a warm amber
design system, four built-in themes, and one consistent motion language.

[![npm version](https://img.shields.io/npm/v/@bpdm/ng.svg)](https://www.npmjs.com/package/@bpdm/ng)
[![license](https://img.shields.io/npm/l/@bpdm/ng.svg)](./LICENSE)

**[Live demo & docs → ui.bpdm.dev](https://ui.bpdm.dev)** — interactive Storybook with every component, variant, and theme.

> The Angular implementation of the **bpdm design system**. It shares the exact same
> design tokens (`@bpdm/tokens`) and variant definitions (`@bpdm/variants`) as the
> React package (`@bpdm/ui`), so components look and move identically across frameworks.
> See the [monorepo overview](https://github.com/BDev-9/bpdm-ui).

---

## Features

- **Standalone & modern** — standalone directives/components, signal inputs, zoneless-ready.
- **Accessible by default** — native elements enhanced via attribute directives; Angular CDK for focus, keyboard, ARIA and overlays.
- **Themeable** — components read semantic CSS variables; switch the whole UI with one `data-theme`, or override variables to match your brand.
- **Four built-in themes** — `paper` & `mist` (light), `charcoal` & `slate` (dark).
- **One motion language** — shared easing/duration tokens; honors `prefers-reduced-motion`.
- **Tree-shakeable** — standalone + FESM + `sideEffects: false`; only the components you import ship.

## Install

```bash
npm install @bpdm/ng
# peers: @angular/core ^21, @angular/common ^21, @angular/cdk ^21, rxjs ^7.8, tailwindcss ^4
```

## Compatibility

| Dependency | Supported | Notes |
| --- | --- | --- |
| **Angular** | **21.x** | `@angular/core`, `@angular/common`, `@angular/cdk` as peers (`^21`) |
| **Tailwind CSS** | **4.x** _(required)_ | the tokens use Tailwind 4 syntax; declared as a peer |
| **TypeScript** | 5.9+ | matched to the Angular version |

**Support policy:** we track the **current and previous major** of Angular; older majors are best-effort and only dropped in a minor release, noted in the changelog. Tailwind CSS **4 is required**.

## Setup

`@bpdm/ng` ships Tailwind class names, so your app's Tailwind generates the styles.
In your global `styles.css`:

```css
@import "tailwindcss";
@import "@bpdm/tokens/tokens.css";              /* design tokens + themes */
@import "@angular/cdk/overlay-prebuilt.css";    /* required for overlays (tooltip, …) */
@source "../node_modules/@bpdm/ng";             /* the components */
@source "../node_modules/@bpdm/variants/dist";  /* the shared variant classes */
```

Pick a theme on any ancestor (default is `paper`):

```html
<html data-theme="paper">    <!-- light · warm (default) -->
<html data-theme="charcoal"> <!-- dark · warm -->
```

## Usage

Import the standalone directive where you use it:

```ts
import { Component } from "@angular/core";
import { BpdmButton } from "@bpdm/ng";

@Component({
  selector: "app-root",
  imports: [BpdmButton],
  template: `
    <button bpdmButton variant="primary" (click)="save()">Save changes</button>
    <a bpdmButton variant="ghost" href="/docs">Read the docs</a>
  `,
})
export class AppComponent {
  save() {}
}
```

Button styling is applied as an **attribute directive on a native `<button>`/`<a>`**
(the Angular Material pattern), so native focus, keyboard, `type` and `disabled`
semantics are preserved. Components without a native equivalent (Card, Dialog, …)
ship as element components (`<bpdm-card>`).

## Components

**Actions** — `bpdmButton`

**Overlay** — `bpdmTooltip`

_More components are landing incrementally; track progress on **[ui.bpdm.dev](https://ui.bpdm.dev)**._

## Theming

Components never hardcode colors — they read CSS variables (`--primary`,
`--background`, …). Re-brand by overriding those variables, globally or scoped:

```css
:root {
  --primary: #7c3aed;
  --ring: #7c3aed;
  --primary-foreground: #fff;
}
```

## Local development

This package lives in the [bpdm-ui monorepo](https://github.com/BDev-9/bpdm-ui).
From the repo root:

```bash
pnpm install
pnpm --filter @bpdm/ng storybook   # docs/playground at http://localhost:8001
pnpm --filter @bpdm/ng build       # bundle the library (ng-packagr → FESM + types)
pnpm --filter @bpdm/ng test        # unit tests (Angular's official Vitest builder)
```

## Contributing

Conventions, project structure, and how to add a component are in
[CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[MIT](../../LICENSE) © [Bhavin P. Devamorari](https://bpdm.dev)
</content>
