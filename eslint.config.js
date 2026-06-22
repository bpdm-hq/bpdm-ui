import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist", "storybook-static", "node_modules"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      // the two classic, high-value hook rules (skip the experimental v7
      // compiler rules, which false-positive on store subscriptions, the
      // virtualizer, etc.)
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // Storybook stories: `render` is a lowercase component-like function, so the
  // rules-of-hooks check misfires; deps churn is fine in demos.
  {
    files: ["**/*.stories.tsx"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
  // tests + config run in node/vitest
  {
    files: ["**/*.test.{ts,tsx}", "vitest.setup.ts", "vitest.config.ts"],
    languageOptions: { globals: { ...globals.node } },
  },
);
