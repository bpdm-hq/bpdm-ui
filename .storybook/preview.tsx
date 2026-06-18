import type { Preview } from "@storybook/react-vite";
import { useEffect } from "react";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      storySort: {
        order: ["Actions", "Inputs", "Selection", "Data Display", "Overlay", "Navigation"],
      },
    },
  },
  // a "Theme" dropdown — 2 light + 2 dark, applied via data-theme
  globalTypes: {
    theme: {
      description: "Theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: [
          { value: "paper", title: "Paper · light", icon: "circlehollow" },
          { value: "mist", title: "Mist · light", icon: "circlehollow" },
          { value: "charcoal", title: "Charcoal · dark", icon: "circle" },
          { value: "slate", title: "Slate · dark", icon: "circle" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "paper" },
  // render every story on the selected theme surface. Canvas = full-height;
  // Docs previews = fit content (no 100vh blocks).
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as string) ?? "paper";
      // also set on <html> so PORTALED content (Select/MultiSelect popovers,
      // which render at <body>) inherits the theme — not just the wrapper.
      useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
      }, [theme]);
      const isDocs = context.viewMode === "docs";
      const surface = "bg-background font-sans text-foreground";
      return (
        <div
          data-theme={theme}
          className={isDocs ? `${surface} p-6` : `${surface} min-h-screen p-10`}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
