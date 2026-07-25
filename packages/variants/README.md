# @bpdm/variants

Framework-agnostic **styling primitives** for the [bpdm design system](https://ui.bpdm.dev) —
the shared class-merge helper (`cn`) and the `class-variance-authority` (cva)
variant maps that map component options to token-based Tailwind classes.

Because these are plain TypeScript (no framework imports), the **same variant
class strings drive every framework package** — `@bpdm/ui` (React) and `@bpdm/ng`
(Angular) render byte-identical markup, so a Button looks the same everywhere.

## What's inside

- **`cn(...classes)`** — merge class names safely (`clsx` + `tailwind-merge`).
- **Variant maps** — `buttonVariants`, … : cva configs returning the right
  Tailwind classes for a given `variant` / `size` / `shape`.
- **`VariantProps`** — re-exported cva type helper to derive prop types.

## Usage

```ts
import { cn, buttonVariants } from "@bpdm/variants";

// → the class string for a primary, medium button
const cls = cn(buttonVariants({ variant: "primary", size: "md" }), "w-full");
```

You normally consume these **through** a framework package (`@bpdm/ui` /
`@bpdm/ng`); install `@bpdm/variants` directly only when building your own
components on the same design system.

## License

[MIT](../../LICENSE) © [bpdm](https://bpdm.dev)
</content>
