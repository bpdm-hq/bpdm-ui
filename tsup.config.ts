import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  // peers — never bundle React; everything else in `dependencies` is also
  // externalized by tsup so consumers dedupe via their own install.
  external: ["react", "react-dom"],
});
