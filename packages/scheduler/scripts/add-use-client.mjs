import { readFileSync, writeFileSync } from "node:fs";

// Prepend the "use client" directive to the built entry files so the component
// drops into a React Server Components app (Next.js App Router) unchanged.
// Done post-build because the bundler strips a module-level directive banner.
for (const file of ["dist/index.js", "dist/index.cjs"]) {
  const source = readFileSync(file, "utf8");
  if (!source.startsWith('"use client"')) {
    writeFileSync(file, `"use client";\n${source}`);
  }
}
