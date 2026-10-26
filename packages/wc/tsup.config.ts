import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/button/bpdm-button.ts"],
  format: ["esm"],
  target: "es2022",
  dts: true,
  clean: true,
  sourcemap: true,
  // Keep Lit external so consumers dedupe a single copy across @bpdm/wc components.
  external: ["lit"],
});
