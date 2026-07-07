'use client';

import { useState } from 'react';

// Single source of truth — mirrors the Storybook "Custom theme" starter.
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

const btn =
  'inline-flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-card px-2.5 py-1 text-xs font-medium text-fd-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground';

export function ThemeStarter() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(THEME_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([THEME_TEMPLATE], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bpdm-theme.css';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-fd-border">
      <div className="flex items-center justify-between gap-2 border-b border-fd-border bg-fd-muted px-3 py-2">
        <span className="font-mono text-xs text-fd-muted-foreground">bpdm-theme.css</span>
        <div className="flex gap-2">
          <button type="button" onClick={copy} className={btn}>
            {copied ? 'Copied ✓' : 'Copy'}
          </button>
          <button type="button" onClick={download} className={btn}>
            Download
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
        <code>{THEME_TEMPLATE}</code>
      </pre>
    </div>
  );
}
