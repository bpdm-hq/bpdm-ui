# @bpdm/tokens

Framework-agnostic **design tokens** for the [bpdm design system](https://ui.bpdm.dev) —
the single source of truth shared by every framework package (`@bpdm/ui` for React,
`@bpdm/ng` for Angular, …). One warm amber identity, four built-in themes, and one
motion language, expressed as plain CSS variables.

This is a **CSS-only** package — no JavaScript, no build step. It **requires
Tailwind CSS 4** in the consuming app (the tokens use Tailwind 4 syntax such as
`@theme inline` and custom variants; they won't compile on Tailwind 3).

## What's inside

- **Semantic color variables** — `--primary`, `--background`, `--muted`, `--success`, … resolved per theme.
- **Four themes** — `paper` & `mist` (light), `charcoal` & `slate` (dark), selected with a `data-theme` attribute.
- **Motion language** — shared easing/duration tokens (`--bpdm-ease-out`, `--bpdm-duration-base`, …) and keyframes; honors `prefers-reduced-motion`.
- **Tailwind 4 bridge** — `@theme inline` maps the variables to Tailwind color utilities, plus a `dark` custom variant.

## Usage

Import it after Tailwind in your global CSS:

```css
@import "tailwindcss";
@import "@bpdm/tokens/tokens.css";
```

Pick a theme on any ancestor (default is `paper`):

```html
<html data-theme="paper">    <!-- light · warm (default) -->
<html data-theme="mist">     <!-- light · cool -->
<html data-theme="charcoal"> <!-- dark · warm -->
<html data-theme="slate">    <!-- dark · cool, enterprise -->
```

Re-brand by overriding any token, globally or scoped:

```css
:root {
  --primary: #7c3aed;
  --ring: #7c3aed;
  --primary-foreground: #fff;
}
```

> If you use a framework package like `@bpdm/ui`, these tokens are already bundled
> into its `styles.css` — you only need `@bpdm/tokens` directly when theming a
> non-bpdm app or building your own components on the same system.

## License

[MIT](../../LICENSE) © [bpdm](https://bpdm.dev)
</content>
