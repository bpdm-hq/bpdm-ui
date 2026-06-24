import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { Info } from "lucide-react";
import { Tooltip } from "./tooltip";
import { Button } from "./button";

const usage = `
Hover/focus tooltip built on an accessible primitive — keyboard + screen-reader
friendly, portaled (escapes \`overflow: hidden\`), and theme-aware. Zero-config:
pass \`content\` and wrap any focusable element.

\`\`\`tsx
import { Tooltip } from "@bpdm/ui";

<Tooltip content="Copy address">
  <Button size="icon" variant="ghost" aria-label="Copy"><CopyIcon /></Button>
</Tooltip>
\`\`\`

Wrap the app in \`<TooltipProvider>\` only if you want one shared open delay.
`;

const meta: Meta<typeof Tooltip> = {
  title: "Overlay/Tooltip",
  component: Tooltip,
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
    side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    delayDuration: { control: { type: "number", min: 0, max: 1000, step: 50 } },
    hideArrow: { control: "boolean" },
    disabled: { control: "boolean" },
    content: { control: "text" },
    children: { table: { disable: true } },
  },
  args: { content: "Copy address", side: "top" },
  render: (args) => (
    <div className="flex min-h-24 items-center justify-center">
      <Tooltip {...args}>
        <Button variant="outline">Hover me</Button>
      </Tooltip>
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Playground: Story = {};

export const Sides: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Button, Tooltip } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex gap-4">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side} content={\`Side: \${side}\`} side={side}>
          <Button variant="outline" className="capitalize">
            {side}
          </Button>
        </Tooltip>
      ))}
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="grid place-items-center gap-6 py-8">
      <div className="flex gap-4">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <Tooltip key={side} content={`Side: ${side}`} side={side}>
            <Button variant="outline" className="capitalize">
              {side}
            </Button>
          </Tooltip>
        ))}
      </div>
    </div>
  ),
};

// the common case: explain an icon-only button
export const OnIconButton: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Info } from "lucide-react";
import { Button, Tooltip } from "@bpdm/ui";

export function Example() {
  return (
    <Tooltip content="Only your team can see this project">
      <Button size="icon" variant="ghost" aria-label="Info">
        <Info className="size-5" />
      </Button>
    </Tooltip>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex min-h-24 items-center justify-center">
      <Tooltip content="Only your team can see this project">
        <Button size="icon" variant="ghost" aria-label="Info">
          <Info className="size-5" />
        </Button>
      </Tooltip>
    </div>
  ),
};

export const RichContent: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Button, Tooltip } from "@bpdm/ui";

export function Example() {
  return (
    <Tooltip
      side="right"
      content={
        <div className="space-y-1">
          <p className="font-medium text-foreground">Auto-sync</p>
          <p className="text-muted-foreground">Changes sync across devices in real time.</p>
        </div>
      }
    >
      <Button variant="outline">Sync info</Button>
    </Tooltip>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex min-h-28 items-center justify-center">
      <Tooltip
        side="right"
        content={
          <div className="space-y-1">
            <p className="font-medium text-foreground">Auto-sync</p>
            <p className="text-muted-foreground">Changes sync across devices in real time.</p>
          </div>
        }
      >
        <Button variant="outline">Sync info</Button>
      </Tooltip>
    </div>
  ),
};

// the `disabled` prop turns the *tooltip* off — the trigger stays interactive.
// Shown as a contrast so the effect is visible: left shows on hover, right never does.
export const Disabled: Story = {
  name: "Disabled (tooltip off)",
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Button, Tooltip } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex gap-10">
      {/* tooltip on → shows on hover */}
      <Tooltip content="Saves your changes">
        <Button variant="outline">Tooltip on</Button>
      </Tooltip>

      {/* disabled → tooltip suppressed; the button still works */}
      <Tooltip content="Saves your changes" disabled>
        <Button variant="outline">Tooltip off</Button>
      </Tooltip>
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex min-h-24 items-center justify-center gap-12">
      <div className="flex flex-col items-center gap-2">
        <Tooltip content="Saves your changes">
          <Button variant="outline">Tooltip on</Button>
        </Tooltip>
        <span className="text-xs text-muted-foreground">hover → tooltip shows</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Tooltip content="Saves your changes" disabled>
          <Button variant="outline">Tooltip off</Button>
        </Tooltip>
        <span className="text-xs text-muted-foreground">disabled → nothing on hover</span>
      </div>
    </div>
  ),
};

// the useful case: a tooltip on a *disabled* control explaining why it's off.
// Disabled buttons don't emit hover/focus events, so the tooltip transparently
// wraps the trigger to keep it reachable — by pointer and by keyboard.
export const OnDisabledTrigger: Story = {
  name: "On a disabled control",
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Button, Tooltip } from "@bpdm/ui";

export function Example() {
  return (
    <Tooltip content="You need the Admin role to publish">
      <Button disabled>Publish</Button>
    </Tooltip>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex min-h-24 items-center justify-center">
      <Tooltip content="You need the Admin role to publish">
        <Button disabled>Publish</Button>
      </Tooltip>
    </div>
  ),
};
