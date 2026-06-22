import { defineConfig } from "tsup";
import { readdirSync } from "node:fs";

// one entry per component → per-component output + subpath imports
// (`@bpdm/ui/button`), plus the `index` barrel. `splitting` factors shared code
// into common chunks so the per-entry files don't duplicate helpers.
const componentEntries = Object.fromEntries(
  readdirSync("src/components")
    .filter((f) => f.endsWith(".tsx") && !f.includes(".stories.") && !f.includes(".test."))
    .map((f) => [f.replace(/\.tsx$/, ""), `src/components/${f}`]),
);

export default defineConfig({
  entry: { index: "src/index.ts", ...componentEntries },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  minify: false,
  // "use client" is added post-build (scripts/add-use-client.mjs) — tsup's banner
  // is unreliable with code-splitting on.
  // peers — never bundle React; everything else in `dependencies` is also
  // externalized by tsup so consumers dedupe via their own install.
  external: ["react", "react-dom"],
});
