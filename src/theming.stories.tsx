import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { Button } from "./components/button";
import { Checkbox } from "./components/checkbox";
import { Input } from "./components/input";
import { Switch } from "./components/switch";

/**
 * Theming demo. Components read semantic CSS variables (--primary, --background…),
 * so a consumer re-themes by *overriding those variables* — no component changes,
 * no rebuild. Scope an override to a subtree (inline style / a class) or globally
 * (`:root { --primary: ... }`).
 */
const guide = `
Components read semantic CSS variables, so theming = **overriding variables**
(no component edits, no rebuild). Use the **Theme** dropdown in the toolbar above
to switch between the four built-in themes.

### 1. Import the styles once
\`\`\`ts
import "@bpdm/ui/styles.css";
\`\`\`

### 2. Pick a theme via \`data-theme\` on an ancestor
\`\`\`html
<html data-theme="paper">   <!-- light · warm (default) -->
<html data-theme="mist">    <!-- light · cool -->
<html data-theme="charcoal"><!-- dark · warm -->
<html data-theme="slate">   <!-- dark · cool, enterprise -->
\`\`\`

### 3. Re-brand — override the variables (global or scoped)
\`\`\`css
:root {
  --primary: #7c3aed;        /* your brand color   */
  --ring: #7c3aed;           /* focus ring to match */
  --primary-foreground: #fff;/* text on the button  */
}
\`\`\`
Every component using \`--primary\` instantly re-skins. The stories below show the
built-in themes and custom overrides.
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

function Sample() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
      </div>
      <Input placeholder="you@company.com" className="max-w-xs" />
      {/* a white card lifting off the page */}
      <div className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
        <p className="mb-3 text-sm font-medium">Card on page</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-sm">
            <Checkbox defaultChecked /> Remember me
          </span>
          <span className="flex items-center gap-2 text-sm">
            <Switch defaultChecked /> Notifications
          </span>
        </div>
      </div>
    </div>
  );
}

// All four built-in themes side by side (same components, different data-theme).
const THEMES = [
  { id: "paper", label: "Paper · light (default)" },
  { id: "mist", label: "Mist · light" },
  { id: "charcoal", label: "Charcoal · dark (default)" },
  { id: "slate", label: "Slate · dark · enterprise" },
];

export const AllThemes: Story = {
  parameters: {
    docs: {
      source: {
        code: `// pick a theme on any ancestor (html, body, or a wrapper)
<div data-theme="slate">
  <Button>Primary</Button>
  <Input placeholder="you@company.com" />
</div>`,
      },
    },
  },
  render: () => (
    <div className="grid gap-6 md:grid-cols-2">
      {THEMES.map((t) => (
        <div
          key={t.id}
          data-theme={t.id}
          className="rounded-xl border border-border bg-background p-8 text-foreground"
        >
          <p className="mb-5 text-sm font-medium text-muted-foreground">
            {t.label}
          </p>
          <Sample />
        </div>
      ))}
    </div>
  ),
};

// ── Downloadable starter for a custom theme ──────────────────────
const THEME_TEMPLATE = `/* @bpdm/ui — custom theme starter.
   1. Import the library styles first:   @import "@bpdm/ui/styles.css";
   2. Drop this block in your CSS, rename the selector, set your colors.
   3. Apply it:   <html data-theme="my-brand"> … </html>
   Components re-skin automatically — no rebuild.

   REQUIRED (set these for a usable theme):
     --background --foreground --primary --primary-foreground --border --ring
   OPTIONAL (fine-tune surfaces/states; omit to inherit the active theme). */

[data-theme="my-brand"] {
  /* color-scheme: dark;   ← uncomment for a DARK theme */

  --radius: 0.625rem;               /* optional — corner rounding */

  /* ── REQUIRED: core surface + brand ── */
  --background: #ffffff;            /* page background        */
  --foreground: #1a1a1f;            /* default text           */
  --primary: #f5a623;              /* brand / accent fill    */
  --primary-foreground: #1a1205;   /* text on primary        */
  --border: #e6e4e1;               /* hairline borders       */
  --ring: #f5a623;                 /* focus ring             */

  /* ── OPTIONAL: surfaces ── */
  --card: #ffffff;                 --card-foreground: #1a1a1f;
  --popover: #ffffff;              --popover-foreground: #1a1a1f;
  --muted: #f1f0ee;                --muted-foreground: #6b6a73;
  --input: #d8d6d2;                /* input/checkbox/switch borders */

  /* ── OPTIONAL: secondary · accent · destructive ── */
  --secondary: #f1f0ee;            --secondary-foreground: #1a1a1f;
  --accent: #ff7a3c;               --accent-foreground: #1a1205;
  --destructive: #ef4444;          --destructive-foreground: #fafafa;
}
`;

const TOKENS: { name: string; required: boolean; note: string }[] = [
  { name: "--background", required: true, note: "page background" },
  { name: "--foreground", required: true, note: "default text" },
  { name: "--primary", required: true, note: "brand / accent fill" },
  { name: "--primary-foreground", required: true, note: "text on primary" },
  { name: "--border", required: true, note: "hairline borders" },
  { name: "--ring", required: true, note: "focus ring" },
  { name: "--radius", required: false, note: "corner rounding" },
  { name: "--card / --card-foreground", required: false, note: "raised surfaces" },
  { name: "--popover / --popover-foreground", required: false, note: "menus, popovers" },
  { name: "--muted / --muted-foreground", required: false, note: "subtle bg + secondary text" },
  { name: "--input", required: false, note: "input/checkbox/switch borders" },
  { name: "--secondary / --secondary-foreground", required: false, note: "secondary button" },
  { name: "--accent / --accent-foreground", required: false, note: "accent fill" },
  { name: "--destructive / --destructive-foreground", required: false, note: "errors/danger" },
];

function downloadTheme() {
  const blob = new Blob([THEME_TEMPLATE], { type: "text/css" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bpdm-theme.css";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const CustomThemeTemplate: Story = {
  parameters: {
    docs: {
      source: { code: THEME_TEMPLATE, language: "css" },
    },
  },
  render: () => (
    <div className="max-w-2xl space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={downloadTheme}>Download bpdm-theme.css</Button>
        <span className="text-sm text-muted-foreground">
          Starter file with every variable — required ones marked.
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">CSS variable</th>
              <th className="px-4 py-2 font-medium">Required</th>
              <th className="px-4 py-2 font-medium">Purpose</th>
            </tr>
          </thead>
          <tbody>
            {TOKENS.map((t) => (
              <tr key={t.name} className="border-t border-border">
                <td className="px-4 py-2 font-mono text-xs text-foreground">
                  {t.name}
                </td>
                <td className="px-4 py-2">
                  {t.required ? (
                    <span className="font-medium text-primary">required</span>
                  ) : (
                    <span className="text-muted-foreground">optional</span>
                  )}
                </td>
                <td className="px-4 py-2 text-muted-foreground">{t.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
};
