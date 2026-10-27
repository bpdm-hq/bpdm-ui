// Build the shippable, self-contained @bpdm/ng/styles.css (parity with @bpdm/ui).
//
// Output = namespaced design tokens (@bpdm/tokens) + PRECOMPILED utilities for
// every class the Angular components use. A consumer can import this one file and
// needs NO Tailwind of their own: colours are arbitrary `[var(--bpdm-*)]` values
// (unique class names, so they never collide with the host app's `bg-primary`),
// and the theme is rebranded by overriding a single `--bpdm-*` token.
//
// No preflight/reset is included, so the library never resets the consumer's base
// element styles. Apps that already run Tailwind can keep the classic setup
// (import @bpdm/tokens/tokens.css + let their Tailwind generate the classes).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

const here = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(here, ".."); // packages/angular
const root = path.resolve(pkg, "../.."); // repo root

const tokensCss = fs.readFileSync(path.resolve(pkg, "node_modules/@bpdm/tokens/tokens.css"), "utf8");

// Drop the Tailwind `@theme inline { … }` block: it exists only for the dev/Storybook
// build (semantic utilities). The shipped file exposes no unprefixed theme colours.
const tokensRuntime = tokensCss.replace(/@theme[^{]*\{[\s\S]*?\n\}/m, "").replace(/\n{3,}/g, "\n\n").trimEnd();

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

// ng-packagr generates dist/package.json; add the "./styles.css" export so
// consumers can `import "@bpdm/ng/styles.css"` (the self-contained option).
const distPkgPath = path.resolve(pkg, "dist/package.json");
const distPkg = JSON.parse(fs.readFileSync(distPkgPath, "utf8"));
distPkg.exports = { ...(distPkg.exports ?? {}), "./styles.css": "./styles.css" };
fs.writeFileSync(distPkgPath, `${JSON.stringify(distPkg, null, 2)}\n`);

console.log(`[bpdm] dist/styles.css ${kb}kB + ./styles.css export (namespaced tokens + precompiled utilities, no preflight)`);
