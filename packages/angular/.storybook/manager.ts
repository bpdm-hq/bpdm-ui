import { addons } from "storybook/manager-api";
import { bpdmTheme } from "./theme";

// Brand the Storybook UI (sidebar, toolbar) as @bpdm/ng — dark amber, matching
// the React (@bpdm/ui) Storybook so the two framework docs feel like one system.
addons.setConfig({ theme: bpdmTheme });
