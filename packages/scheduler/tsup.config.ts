import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  // "use client" is prepended post-build (scripts/add-use-client.mjs) — tsup's
  // banner is dropped by the bundler as a stray module directive.
  external: ["react", "react-dom", "@bpdm/scheduler-core"],
});
