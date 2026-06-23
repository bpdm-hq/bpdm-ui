import { addons } from "storybook/manager-api";
import { bpdmTheme } from "./theme";

// Brand the Storybook UI (sidebar, toolbar) as @bpdm/ui — dark amber.
addons.setConfig({ theme: bpdmTheme });
