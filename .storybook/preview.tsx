import type { Preview } from "@storybook/react-vite";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  // Canvas = full-height surface; Docs previews = fit content (no min-h-screen,
  // otherwise every doc preview block becomes 100vh tall).
  decorators: [
    (Story, context) => {
      const isDocs = context.viewMode === "docs";
      const surface = "bg-background font-sans text-foreground";
      return (
        <div
          className={isDocs ? `${surface} p-6` : `${surface} min-h-screen p-10`}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
