import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { useState } from "react";
import { ArrowRight, Bell, Check, Download, Heart, Mail, Plus, Search, Star, Trash2 } from "lucide-react";
import { Button } from "./button";

// one distinct icon per severity — used by the icon-only matrix
const SEVERITY_ICONS = [
  { variant: "primary", label: "Add", icon: <Plus className="size-4" /> },
  { variant: "secondary", label: "Favorite", icon: <Star className="size-4" /> },
  { variant: "success", label: "Confirm", icon: <Check className="size-4" /> },
  { variant: "info", label: "Notifications", icon: <Bell className="size-4" /> },
  { variant: "warning", label: "Download", icon: <Download className="size-4" /> },
  { variant: "help", label: "Messages", icon: <Mail className="size-4" /> },
  { variant: "destructive", label: "Delete", icon: <Trash2 className="size-4" /> },
  { variant: "contrast", label: "Like", icon: <Heart className="size-4" /> },
] as const;

const usage = `
Accessible button built with class-variance-authority. Two independent axes —
\`variant\` (colour / severity) and \`appearance\` (\`solid\` / \`outline\` / \`ghost\`) —
plus \`size\`, \`shape\`, and \`asChild\`.

\`\`\`tsx
import { Button } from "@bpdm/ui";

<Button>Save</Button>
<Button variant="success">Publish</Button>
<Button variant="destructive" appearance="outline">Delete</Button>
<Button variant="secondary" appearance="ghost">Cancel</Button>

// icon-only — always give an aria-label
<Button size="icon" aria-label="Search"><SearchIcon /></Button>

// circle / pill
<Button size="icon" shape="round" aria-label="Add"><PlusIcon /></Button>

// render as another element (e.g. a link)
<Button asChild><a href="/docs">Docs</a></Button>
\`\`\`
`;

const COLORS = [
  "primary", "secondary", "success", "info",
  "warning", "help", "destructive", "contrast",
] as const;

const meta: Meta<typeof Button> = {
  title: "Actions/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: usage },
      page: () => (
        <>
          <Title />
          <Description />
          <h2>Playground</h2>
          <Primary />
          <Controls />
          <h2>Examples</h2>
          <Stories includePrimary={false} />
        </>
      ),
    },
  },
  argTypes: {
    variant: { control: "select", options: COLORS },
    appearance: { control: "inline-radio", options: ["solid", "outline", "ghost"] },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "iconSm", "icon", "iconLg", "none"],
    },
    shape: { control: "select", options: ["default", "round"] },
  },
  args: { children: "Button" },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {
  args: { children: "Button", variant: "primary", appearance: "solid", size: "md", shape: "default" },
};

// every colour / severity, filled
export const AllVariants: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Button } from "@bpdm/ui";

export function Example() {
  return (
    <>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="success">Success</Button>
      <Button variant="info">Info</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="help">Help</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="contrast">Contrast</Button>
    </>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-3">
      {COLORS.map((v) => (
        <Button key={v} variant={v} className="capitalize">
          {v}
        </Button>
      ))}
    </div>
  ),
};

// same severities, bordered (transparent fill)
export const Outlined: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Button } from "@bpdm/ui";

export function Example() {
  return (
    <>
      <Button variant="primary" appearance="outline">Primary</Button>
      <Button variant="success" appearance="outline">Success</Button>
      <Button variant="destructive" appearance="outline">Destructive</Button>
      <Button variant="contrast" appearance="outline">Contrast</Button>
    </>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-3">
      {COLORS.map((v) => (
        <Button key={v} variant={v} appearance="outline" className="capitalize">
          {v}
        </Button>
      ))}
    </div>
  ),
};

// same severities, no border or fill
export const Ghost: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Button } from "@bpdm/ui";

export function Example() {
  return (
    <>
      <Button variant="primary" appearance="ghost">Primary</Button>
      <Button variant="success" appearance="ghost">Success</Button>
      <Button variant="destructive" appearance="ghost">Destructive</Button>
      <Button variant="secondary" appearance="ghost">Secondary</Button>
    </>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-3">
      {COLORS.map((v) => (
        <Button key={v} variant={v} appearance="ghost" className="capitalize">
          {v}
        </Button>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Button } from "@bpdm/ui";

export function Example() {
  return (
    <>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// Icon + text: just drop an icon into children — base `gap-2` spaces it.
export const WithIcon: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { ArrowRight, Plus } from "lucide-react";
import { Button } from "@bpdm/ui";

export function Example() {
  return (
    <>
      <Button><Plus className="size-4" /> New item</Button>
      <Button variant="secondary" appearance="outline">Continue <ArrowRight className="size-4" /></Button>
    </>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>
        <Plus className="size-4" /> New item
      </Button>
      <Button variant="secondary" appearance="outline">
        Continue <ArrowRight className="size-4" />
      </Button>
    </div>
  ),
};

// Icon-only matrix: every severity × every appearance (square `size="icon"`).
// Always pass an `aria-label` — there's no visible text.
export const IconOnly: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Bell, Check, Download, Heart, Mail, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@bpdm/ui";

const icons = [
  { variant: "primary", label: "Add", icon: <Plus className="size-4" /> },
  { variant: "secondary", label: "Favorite", icon: <Star className="size-4" /> },
  { variant: "success", label: "Confirm", icon: <Check className="size-4" /> },
  { variant: "info", label: "Notifications", icon: <Bell className="size-4" /> },
  { variant: "warning", label: "Download", icon: <Download className="size-4" /> },
  { variant: "help", label: "Messages", icon: <Mail className="size-4" /> },
  { variant: "destructive", label: "Delete", icon: <Trash2 className="size-4" /> },
  { variant: "contrast", label: "Like", icon: <Heart className="size-4" /> },
] as const;

export function Example() {
  return (
    <div className="space-y-3">
      {(["solid", "outline", "ghost"] as const).map((appearance) => (
        <div key={appearance} className="flex gap-3">
          {icons.map((i) => (
            <Button key={i.variant} size="icon" shape="round" variant={i.variant} appearance={appearance} aria-label={i.label}>
              {i.icon}
            </Button>
          ))}
        </div>
      ))}
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="space-y-3">
      {(["solid", "outline", "ghost"] as const).map((appearance) => (
        <div key={appearance} className="flex flex-wrap gap-3">
          {SEVERITY_ICONS.map((i) => (
            <Button
              key={i.variant}
              size="icon"
              shape="round"
              variant={i.variant}
              appearance={appearance}
              aria-label={i.label}
            >
              {i.icon}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};

// Circle icon buttons: `shape="round"` turns the square into a circle.
export const RoundIcon: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Heart, Plus, Search } from "lucide-react";
import { Button } from "@bpdm/ui";

export function Example() {
  return (
    <>
      <Button size="iconSm" shape="round" variant="secondary" appearance="outline" aria-label="Search"><Search className="size-4" /></Button>
      <Button size="icon" shape="round" aria-label="Add"><Plus className="size-5" /></Button>
      <Button size="iconLg" shape="round" variant="secondary" aria-label="Like"><Heart className="size-5" /></Button>
    </>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="iconSm" shape="round" variant="secondary" appearance="outline" aria-label="Search">
        <Search className="size-4" />
      </Button>
      <Button size="icon" shape="round" aria-label="Add">
        <Plus className="size-5" />
      </Button>
      <Button size="iconLg" shape="round" variant="secondary" aria-label="Like">
        <Heart className="size-5" />
      </Button>
    </div>
  ),
};

// `size="none"` drops the preset height/padding so you own the sizing entirely.
export const CustomSize: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Search } from "lucide-react";
import { Button } from "@bpdm/ui";

export function Example() {
  return (
    <>
      <Button size="icon" variant="secondary" appearance="outline" aria-label="Search"><Search className="size-5" /></Button>
      <Button size="none" variant="secondary" appearance="ghost" className="size-6 rounded-md" aria-label="Search">
        <Search className="size-3.5" />
      </Button>
      <Button size="none" variant="secondary" appearance="outline" className="h-7 px-2 text-xs rounded-md">Tiny</Button>
      <Button size="none" variant="primary" className="h-14 px-8 text-lg rounded-2xl">Chunky</Button>
    </>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="icon" variant="secondary" appearance="outline" aria-label="Search (preset)">
        <Search className="size-5" />
      </Button>
      <Button size="none" variant="secondary" appearance="ghost" className="size-6 rounded-md" aria-label="Search (size-6)">
        <Search className="size-3.5" />
      </Button>
      <Button size="none" variant="secondary" appearance="outline" className="h-7 rounded-md px-2 text-xs">
        Tiny
      </Button>
      <Button size="none" variant="primary" className="h-14 rounded-2xl px-8 text-lg">
        Chunky
      </Button>
    </div>
  ),
};

// Pill: `shape="round"` gives fully-rounded ends — works with every severity.
export const Pill: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Button } from "@bpdm/ui";

export function Example() {
  return (
    <>
      <Button shape="round" variant="primary">Primary</Button>
      <Button shape="round" variant="secondary">Secondary</Button>
      <Button shape="round" variant="success">Success</Button>
      <Button shape="round" variant="info">Info</Button>
      <Button shape="round" variant="warning">Warning</Button>
      <Button shape="round" variant="help">Help</Button>
      <Button shape="round" variant="destructive">Destructive</Button>
      <Button shape="round" variant="contrast">Contrast</Button>
    </>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {COLORS.map((v) => (
        <Button key={v} shape="round" variant={v} className="capitalize">
          {v}
        </Button>
      ))}
    </div>
  ),
};

// Loading: a spinner + `aria-busy`; interaction is blocked while busy.
export const Loading: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { Button } from "@bpdm/ui";

export function Example() {
  const [saving, setSaving] = useState(false);
  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1600);
  };
  return (
    <>
      <Button loading={saving} onClick={save}>{saving ? "Saving…" : "Save changes"}</Button>
      <Button loading variant="secondary" appearance="outline">Please wait</Button>
      <Button loading size="icon" aria-label="Loading" />
    </>
  );
}`,
      },
    },
  },
  render: function LoadingStory() {
    const [saving, setSaving] = useState(false);
    const save = () => {
      setSaving(true);
      setTimeout(() => setSaving(false), 1600);
    };
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Button loading={saving} onClick={save}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <Button loading variant="secondary" appearance="outline">
          Please wait
        </Button>
        <Button loading size="icon" aria-label="Loading" />
      </div>
    );
  },
};

// Disabled: native `disabled` — dimmed, unfocusable, non-interactive.
export const Disabled: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Button } from "@bpdm/ui";

export function Example() {
  return (
    <>
      <Button disabled>Disabled</Button>
      <Button disabled appearance="outline">Disabled</Button>
      <Button disabled variant="secondary">Disabled</Button>
    </>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled>Disabled</Button>
      <Button disabled appearance="outline">
        Disabled
      </Button>
      <Button disabled variant="secondary">
        Disabled
      </Button>
    </div>
  ),
};
