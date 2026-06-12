import type { Preview } from "@storybook/react-vite";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
  // every story renders on our dark, branded surface
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background p-10 font-sans text-foreground">
        <Story />
      </div>
    ),
  ],
};

export default preview;
