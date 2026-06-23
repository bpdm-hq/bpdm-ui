import type { Preview } from "@storybook/angular";
import { componentWrapperDecorator } from "@storybook/angular";
// global styles (Tailwind + tokens) are wired via angular.json `styles`

const THEMES = ["paper", "mist", "charcoal", "slate"] as const;

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      storySort: { order: ["Introduction", "Actions", "*"] },
    },
  },
  // a `data-theme` toolbar so every story can be viewed in all four themes
  initialGlobals: { theme: "paper" },
  globalTypes: {
    theme: {
      description: "Design system theme",
      toolbar: {
        title: "Theme",
        icon: "paintbrush",
        items: THEMES.map((t) => ({ value: t, title: t })),
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    // render every story on the themed page surface (so e.g. an elevated card
    // sits on `--background`, not the bare Storybook canvas) with breathing room
    componentWrapperDecorator(
      (story) => `<div class="bg-background font-sans text-foreground p-6">${story}</div>`,
    ),
    (story, context) => {
      const theme = (context.globals["theme"] as string) ?? "paper";
      // also set on <html> so the tokens resolve for portaled content (overlays)
      document.documentElement.setAttribute("data-theme", theme);
      document.body.style.background = "var(--background)";
      document.body.style.color = "var(--foreground)";
      return story();
    },
  ],
};

export default preview;
