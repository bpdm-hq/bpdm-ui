import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  // where Storybook finds component stories
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  // addon-docs: enables the "Docs" pages (autodocs) + per-story "Show code"
  addons: ["@storybook/addon-docs"],
  framework: { name: "@storybook/react-vite", options: {} },
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
