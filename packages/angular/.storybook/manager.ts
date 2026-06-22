import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

// Brand the Storybook UI (sidebar, toolbar) as @bpdm/ng — dark amber, matching
// the React (@bpdm/ui) Storybook so the two framework docs feel like one system.
const theme = create({
  base: "dark",
  brandTitle: "@bpdm/ng",
  brandUrl: "https://bpdm.dev",
  brandTarget: "_blank",
  brandImage: "./logo.svg", // the <Bpdm /> wordmark

  colorPrimary: "#f5a623",
  colorSecondary: "#f5a623",

  appBg: "#0e0e11",
  appContentBg: "#0e0e11",
  appPreviewBg: "#0e0e11",
  appBorderColor: "#27272a",
  appBorderRadius: 10,

  textColor: "#f7f6f3",
  textInverseColor: "#0e0e11",
  textMutedColor: "#a5a3ad",

  barBg: "#16161a",
  barTextColor: "#a5a3ad",
  barSelectedColor: "#f5a623",
  barHoverColor: "#f5a623",

  inputBg: "#16161a",
  inputBorder: "#27272a",
  inputTextColor: "#f7f6f3",
  inputBorderRadius: 8,

  fontBase: '"Inter", system-ui, -apple-system, sans-serif',
});

addons.setConfig({ theme });
