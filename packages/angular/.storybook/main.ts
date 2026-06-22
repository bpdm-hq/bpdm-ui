import type { StorybookConfig } from "@storybook/angular";

const config: StorybookConfig = {
  // the Introduction landing page (.mdx) first, then component stories
  stories: ["../src/**/*.mdx", "../src/**/*.stories.ts"],
  // addon-docs: autodocs pages + per-story "Show code";
  // addon-a11y: a live accessibility audit panel for every story
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: { name: "@storybook/angular", options: {} },
  // serve /public (logo + favicon) at the root
  staticDirs: ["../public"],
  // brand the browser tab: title + favicon
  managerHead: (head) => `${head}
    <title>@bpdm/ng — Angular Component Library</title>
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />`,
};

export default config;
