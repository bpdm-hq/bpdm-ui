import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  // the Introduction landing page (.mdx) first, then component stories
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  // addon-docs: enables the "Docs" pages (autodocs) + per-story "Show code"
  addons: ["@storybook/addon-docs"],
  framework: { name: "@storybook/react-vite", options: {} },
  // serve /public (favicon) at the root
  staticDirs: ["../public"],
  // brand the browser tab: title + favicon
  managerHead: (head) => `${head}
    <title>@bpdm/ui — Component Library</title>
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />`,
  // inject the Tailwind 4 Vite plugin so utility classes are generated
  async viteFinal(viteConfig) {
    const { mergeConfig } = await import("vite");
    const { fileURLToPath } = await import("node:url");
    return mergeConfig(viteConfig, {
      plugins: [tailwindcss()],
      // resolve the "@/..." import alias to /src
      resolve: {
        alias: { "@": fileURLToPath(new URL("../src", import.meta.url)) },
      },
    });
  },
};

export default config;
