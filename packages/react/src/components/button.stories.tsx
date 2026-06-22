import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { ArrowRight, Heart, Plus, Search } from "lucide-react";
import { Button } from "./button";

const usage = `
Accessible button built with class-variance-authority. Supports \`variant\`,
\`size\`, \`shape\`, and \`asChild\` (render as a link, etc).

\`\`\`tsx
import { Button } from "@bpdm/ui";

<Button>Save</Button>
<Button variant="outline" size="lg">Cancel</Button>

// icon-only — always give an aria-label
<Button size="icon" aria-label="Search"><SearchIcon /></Button>

// circle / pill
<Button size="icon" shape="round" aria-label="Add"><PlusIcon /></Button>

// render as another element (e.g. a link)
<Button asChild><a href="/docs">Docs</a></Button>
\`\`\`
`;

const meta: Meta<typeof Button> = {
  title: "Actions/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: usage },
      // custom Docs layout: interactive "Playground" on top, then the
      // example stories below (Playground excluded from that list).
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
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "destructive"],
    },
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

// Interactive — tweak variant / size / shape live from the Controls panel.
export const Playground: Story = {
  args: { children: "Button", variant: "primary", size: "md", shape: "default" },
};

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
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
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
      <Button variant="outline">Continue <ArrowRight className="size-4" /></Button>
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
      <Button variant="outline">
        Continue <ArrowRight className="size-4" />
      </Button>
    </div>
  ),
};

// Icon-only: square `size="icon"`. NOTE: always pass an `aria-label`
// because there is no visible text for screen readers.
export const IconOnly: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Heart, Plus, Search } from "lucide-react";
import { Button } from "@bpdm/ui";

export function Example() {
  return (
    <>
      <Button size="icon" aria-label="Add"><Plus className="size-4" /></Button>
      <Button size="icon" variant="outline" aria-label="Search"><Search className="size-4" /></Button>
      <Button size="icon" variant="ghost" aria-label="Like"><Heart className="size-4" /></Button>
    </>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="icon" aria-label="Add">
        <Plus className="size-4" />
      </Button>
      <Button size="icon" variant="outline" aria-label="Search">
        <Search className="size-4" />
      </Button>
      <Button size="icon" variant="ghost" aria-label="Like">
        <Heart className="size-4" />
      </Button>
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
      <Button size="iconSm" shape="round" variant="outline" aria-label="Search"><Search className="size-4" /></Button>
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
      <Button size="iconSm" shape="round" variant="outline" aria-label="Search">
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

// `size="none"` drops the preset height/padding so you own the sizing entirely
// via className — handy for compact icon affordances inside other components.
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
      {/* preset sizing */}
      <Button size="icon" aria-label="Search"><Search className="size-5" /></Button>

      {/* bring your own dimensions */}
      <Button size="none" variant="ghost" className="size-6 rounded-md" aria-label="Search">
        <Search className="size-3.5" />
      </Button>
      <Button size="none" variant="outline" className="h-7 px-2 text-xs rounded-md">Tiny</Button>
    </>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="icon" variant="outline" aria-label="Search (preset)">
        <Search className="size-5" />
      </Button>
      <Button size="none" variant="ghost" className="size-6 rounded-md" aria-label="Search (size-6)">
        <Search className="size-3.5" />
      </Button>
      <Button size="none" variant="outline" className="h-7 rounded-md px-2 text-xs">
        Tiny
      </Button>
      <Button size="none" variant="primary" className="h-14 rounded-2xl px-8 text-lg">
        Chunky
      </Button>
    </div>
  ),
};

// Pill: `shape="round"` on a text button gives fully-rounded ends.
export const Pill: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { ArrowRight } from "lucide-react";
import { Button } from "@bpdm/ui";

export function Example() {
  return (
    <>
      <Button shape="round">Rounded pill</Button>
      <Button shape="round" variant="outline">Filter <ArrowRight className="size-4" /></Button>
    </>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-3">
      <Button shape="round">Rounded pill</Button>
      <Button shape="round" variant="outline">
        Filter <ArrowRight className="size-4" />
      </Button>
    </div>
  ),
};
