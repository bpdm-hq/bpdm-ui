// Build the shippable, self-contained @bpdm/ui/styles.css.
//
// Output = namespaced design tokens (@bpdm/tokens) + PRECOMPILED utilities for
// every class the components actually use. A consumer imports this one file and
// needs NO Tailwind of their own: colours are arbitrary `[var(--bpdm-*)]` values
// (unique class names, so they never collide with the host app's own `bg-primary`
// etc.), and the whole theme is rebranded by overriding a single `--bpdm-*` token.
//
// No preflight/reset is included, so importing the library never resets the
// consumer's base element styles.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const here = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(here, ".."); // packages/react
const root = path.resolve(pkg, "../.."); // repo root

const tokensCss = fs.readFileSync(path.resolve(pkg, "node_modules/@bpdm/tokens/tokens.css"), "utf8");

// Drop the Tailwind `@theme inline { … }` block: it exists only so the dev/Storybook
// build can still use semantic utilities during the migration. The shipped file must
// expose no unprefixed Tailwind theme colours (no `--color-primary`, …).
const tokensRuntime = tokensCss.replace(/@theme[^{]*\{[\s\S]*?\n\}/m, "").replace(/\n{3,}/g, "\n\n").trimEnd();

// Utilities + theme defaults (spacing, keyframes) — but NOT preflight.
const input = [
  "@layer theme, utilities;",
  "@import 'tailwindcss/theme.css' layer(theme);",
  "@import 'tailwindcss/utilities.css' layer(utilities);",
  `@source '${path.resolve(root, "packages/variants/src")}';`,
  `@source '${path.resolve(pkg, "src")}';`,
].join("\n");

const { css } = await postcss([tailwind()]).process(input, {
  from: path.resolve(pkg, "styles.src.css"),
});

const out = path.resolve(pkg, "dist/styles.css");
fs.writeFileSync(out, `${tokensRuntime}\n\n${css}`);
const kb = (fs.statSync(out).size / 1024).toFixed(1);
console.log(`[bpdm] dist/styles.css ${kb}kB (namespaced tokens + precompiled utilities, no preflight)`);
