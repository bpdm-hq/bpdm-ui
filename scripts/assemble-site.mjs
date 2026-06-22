// Assemble the deployed site:
//   site/            → landing page (framework picker)
//   site/react/      → React Storybook (built to packages/react/storybook-static)
//   site/angular/    → Angular Storybook (added in a later phase)
// Run after the Storybooks are built. Output dir (`site`) is what Vercel serves.
import { rmSync, mkdirSync, cpSync, existsSync } from "node:fs";

const SITE = "site";
const REACT_SB = "packages/react/storybook-static";

rmSync(SITE, { recursive: true, force: true });
mkdirSync(SITE, { recursive: true });

// landing page (index.html + favicon)
cpSync("landing", SITE, { recursive: true });
if (existsSync("packages/react/public/favicon.svg")) {
  cpSync("packages/react/public/favicon.svg", `${SITE}/favicon.svg`);
}

// React Storybook → /react
if (!existsSync(REACT_SB)) {
  console.error(`assemble-site: ${REACT_SB} not found — build the React Storybook first.`);
  process.exit(1);
}
cpSync(REACT_SB, `${SITE}/react`, { recursive: true });

// Angular Storybook → /angular  (enabled once packages/angular exists)
const ANGULAR_SB = "packages/angular/storybook-static";
if (existsSync(ANGULAR_SB)) {
  cpSync(ANGULAR_SB, `${SITE}/angular`, { recursive: true });
  console.log("assemble-site: built site with React + Angular");
} else {
  console.log("assemble-site: built site with React (Angular: coming soon)");
}
