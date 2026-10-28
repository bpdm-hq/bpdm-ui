# Changelog

All notable changes to the bpdm design system packages are recorded here.

## 0.3.0 (2026-10-28)

New ways to restyle the DataTable from props and tokens instead of CSS overrides.
Additive and backward-compatible: every default is unchanged.

### Added

- **DataTable `preset` prop** (`lined` default, `card`, `grid`, `plain`): one name sets
  the baseline for several style props at once, and any individual prop overrides it.
- **DataTable `columnSeparators` and `stickyHeaderShadow` props**: inset vertical
  separators between columns, and a toggle for the header's underline.
- **DataTable `classNames` slot object** (`root`, `table`, `header`, `headerCell`,
  `row`, `cell`), merged with the flat `*ClassName` props.
- **Six DataTable tokens**: `--bpdm-table-separator`, `--bpdm-table-row-bg`,
  `--bpdm-table-row-hover-bg`, `--bpdm-table-row-selected-bg`, `--bpdm-table-stripe-bg`,
  `--bpdm-table-header-bg`. Defaults reproduce the current look.

### Fixed

- Frozen (pinned) DataTable columns now share the spaced-row fill and the hover and
  selected tokens, so a frozen column no longer breaks the row band or highlights
  differently.

### Packages

`@bpdm/ui`, `@bpdm/ng` and `@bpdm/tokens` go to 0.3.0. `@bpdm/variants` is unchanged at 0.2.0.

## 0.2.0 (2026-10-27)

A collision-free, self-contained styling model. This is a breaking change for
anyone who rebrands by overriding the design tokens.

### Breaking

- **Design tokens are namespaced to `--bpdm-*`.** Every token gained a `--bpdm-`
  prefix: `--primary` is now `--bpdm-primary`, `--radius` is `--bpdm-radius`, and
  so on across colours, radius, and the strong/foreground ramps. A bare `--primary`
  can never again clash with a host application's own token of the same name.
- **Component classes reference those tokens as arbitrary values.** Internally the
  components now emit classes like `bg-[var(--bpdm-primary)]` instead of the
  semantic `bg-primary`. The generated class names are unique, so they no longer
  collide with a consuming app's own `bg-primary` utility.

### Added

- **`@bpdm/ui` and `@bpdm/ng` now ship a self-contained `styles.css`.** It bundles
  the namespaced tokens together with every utility the components use, compiled
  ahead of time and with no CSS reset. Importing it is enough to style the
  components: the host app no longer needs Tailwind configured for the library.
  Apps that already run Tailwind can keep the classic setup.
- **`@bpdm/wc` 0.1.0** first release of the framework-agnostic Web Components,
  using the same namespaced tokens.

### Migration

If you rebrand by overriding tokens, add the `--bpdm-` prefix:

```css
/* before */
:root { --primary: #2563eb; --radius: 0.375rem; }

/* after */
:root { --bpdm-primary: #2563eb; --bpdm-radius: 0.375rem; }
```

Nothing else changes. The four built-in themes, the `data-theme` attribute, and
the component APIs are all unchanged. Semantic Tailwind utilities still resolve
for apps that run Tailwind over the tokens, so existing markup keeps working.
