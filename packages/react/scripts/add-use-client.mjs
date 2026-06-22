// Prepend the "use client" directive to every built JS/CJS file.
// All components use hooks/state, so the whole library is client-side; this lets
// it work directly in the Next.js App Router (RSC) without a consumer wrapper.
// (tsup's `banner` is unreliable once code-splitting is on, so we do it here.)
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const dir = "dist";
let touched = 0;
for (const file of readdirSync(dir)) {
  if (!/\.(js|cjs)$/.test(file)) continue;
  const path = `${dir}/${file}`;
  const code = readFileSync(path, "utf8");
  if (code.startsWith('"use client"') || code.startsWith("'use client'")) continue;
  writeFileSync(path, `"use client";\n${code}`);
  touched++;
}
console.log(`add-use-client: prepended directive to ${touched} files`);
