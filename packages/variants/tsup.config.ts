import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  // cva/clsx/tailwind-merge are declared dependencies — tsup externalizes them
  // so consumers dedupe via their own install.
});
