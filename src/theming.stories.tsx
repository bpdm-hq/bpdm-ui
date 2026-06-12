import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { Button } from "./components/button";

/**
 * Theming demo. Components read semantic CSS variables (--primary, --background…),
 * so a consumer re-themes by *overriding those variables* — no component changes,
 * no rebuild. Scope an override to a subtree (inline style / a class) or globally
 * (`:root { --primary: ... }`).
 */
const guide = `
Components read semantic CSS variables, so theming = **overriding variables**
(no component edits, no rebuild). Use the **Theme** dropdown in the toolbar above
to switch light/dark.

### 1. Import the styles once
\`\`\`ts
import "@bpdm/ui/styles.css";
\`\`\`

### 2. Dark mode — add the \`dark\` class on an ancestor
\`\`\`html
<html class="dark"> … </html>
\`\`\`
Light is the default (\`:root\`); \`.dark\` swaps in the dark palette.

### 3. Re-brand — override the variables (global or scoped)
\`\`\`css
:root {
  --primary: #7c3aed;        /* your brand color   */
  --ring: #7c3aed;           /* focus ring to match */
  --primary-foreground: #fff;/* text on the button  */
}
\`\`\`
Every component using \`--primary\` instantly re-skins. The stories below show the
same buttons under different overrides.
`;

const meta: Meta = {
  title: "Theming/Overview",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: { description: { component: guide } },
  },
};
export default meta;

type Story = StoryObj;

function Row() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  );
}

function Brand({ name, vars }: { name: string; vars: CSSProperties }) {
  return (
    <div className="space-y-4 rounded-xl border border-border p-6" style={vars}>
      <p className="text-sm text-muted-foreground">{name}</p>
      <Row />
    </div>
  );
}

// Each "brand" just overrides --primary (+ matching ring/foreground) on a wrapper.
export const CustomBrandColors: Story = {
  parameters: {
    docs: {
      source: {
        code: `/* Global re-brand — put this in your app's CSS */
:root {
  --primary: #7c3aed;
  --ring: #7c3aed;
  --primary-foreground: #ffffff;
}

/* …or scope it to a subtree via inline style */
<div style={{ "--primary": "#0d9488", "--primary-foreground": "#fff" }}>
  <Button>Primary</Button>
</div>`,
      },
    },
  },
  render: () => (
    <div className="space-y-6">
      <Brand name="Default — bpdm amber" vars={{}} />
      <Brand
        name="Override → violet  ( --primary: #7c3aed )"
        vars={
          {
            "--primary": "#7c3aed",
            "--ring": "#7c3aed",
            "--primary-foreground": "#ffffff",
          } as CSSProperties
        }
      />
      <Brand
        name="Override → teal  ( --primary: #0d9488 )"
        vars={
          {
            "--primary": "#0d9488",
            "--ring": "#0d9488",
            "--primary-foreground": "#ffffff",
          } as CSSProperties
        }
      />
    </div>
  ),
};

// Light vs dark side by side — the same components, different raw vars via .dark.
export const LightAndDark: Story = {
  render: () => (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-background p-8 text-foreground">
        <p className="mb-5 text-sm text-muted-foreground">Light (:root)</p>
        <Row />
      </div>
      <div className="dark rounded-xl border border-border bg-background p-8 text-foreground">
        <p className="mb-5 text-sm text-muted-foreground">Dark (.dark)</p>
        <Row />
      </div>
    </div>
  ),
};
