import type { Preview } from "@storybook/react-vite";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  // a "Theme" dropdown in the toolbar — toggles the .dark class live
  globalTypes: {
    theme: {
      description: "Theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "dark", title: "Dark", icon: "circle" },
          { value: "light", title: "Light", icon: "circlehollow" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  // render every story on the selected theme surface (.dark adds the dark vars).
  // Canvas = full-height; Docs previews = fit content (no 100vh blocks).
  decorators: [
    (Story, context) => {
      const isDark = (context.globals.theme ?? "light") === "dark";
      const isDocs = context.viewMode === "docs";
      const surface = `${isDark ? "dark " : ""}bg-background font-sans text-foreground`;
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
