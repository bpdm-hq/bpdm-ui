import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { Popover, PopoverClose } from "./popover";
import { Button } from "./button";
import { Input } from "./input";

const usage = `
Click-triggered floating panel built on an accessible primitive — portaled
(escapes \`overflow: hidden\`), collision-aware (flips/shifts to stay on screen),
and theme-aware. Low-config: pass a \`trigger\` and the panel content as children.

\`\`\`tsx
import { Popover, PopoverClose } from "@bpdm/ui";

<Popover trigger={<Button>Open</Button>}>
  <p>Anything can go here.</p>
  <PopoverClose asChild><Button size="sm">Done</Button></PopoverClose>
</Popover>
\`\`\`
`;

const meta: Meta<typeof Popover> = {
  title: "Overlay/Popover",
  component: Popover,
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
    sideOffset: { control: { type: "number", min: 0, max: 24 } },
    modal: { control: "boolean" },
    showArrow: { control: "boolean" },
    trigger: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: { side: "bottom", align: "center" },
  render: (args) => (
    <div className="flex min-h-48 items-start justify-center pt-6">
      <Popover {...args} trigger={<Button variant="secondary" appearance="outline">Open popover</Button>}>
        <div className="w-64 space-y-1">
          <p className="font-medium">Quick info</p>
          <p className="text-sm text-muted-foreground">
            Popovers can hold any content — text, forms, menus.
          </p>
        </div>
      </Popover>
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Popover>;

export const Playground: Story = {};

export const Placements: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Button, Popover } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex items-center justify-center gap-4">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover
          key={side}
          side={side}
          showArrow
          trigger={
            <Button variant="secondary" appearance="outline" className="capitalize">
              {side}
            </Button>
          }
        >
          <p className="text-sm">Opens on the {side}.</p>
        </Popover>
      ))}
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex min-h-48 items-center justify-center gap-4">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover
          key={side}
          side={side}
          showArrow
          trigger={
            <Button variant="secondary" appearance="outline" className="capitalize">
              {side}
            </Button>
          }
        >
          <p className="text-sm">Opens on the {side}.</p>
        </Popover>
      ))}
    </div>
  ),
};

// a small form inside a popover; PopoverClose dismisses it
export const WithForm: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Button, Input, Popover, PopoverClose } from "@bpdm/ui";

export function Example() {
  return (
    <Popover trigger={<Button>Rename</Button>}>
      <form>
        <Input defaultValue="Q3 Planning" />
        <PopoverClose asChild><Button size="sm">Save</Button></PopoverClose>
      </form>
    </Popover>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="flex min-h-56 items-start justify-center pt-6">
      <Popover trigger={<Button>Rename project</Button>}>
        <form
          className="w-64 space-y-3"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <Input defaultValue="Q3 Planning" />
          </div>
          <div className="flex justify-end gap-2">
            <PopoverClose asChild>
              <Button size="sm" variant="secondary" appearance="ghost">
                Cancel
              </Button>
            </PopoverClose>
            <PopoverClose asChild>
              <Button size="sm">Save</Button>
            </PopoverClose>
          </div>
        </form>
      </Popover>
    </div>
  ),
};

export const WithArrow: Story = {
  tags: ["!dev"],
  args: { showArrow: true },
  parameters: {
    docs: {
      source: {
        code: `import { Button, Popover } from "@bpdm/ui";

export function Example() {
  return (
    <Popover showArrow trigger={<Button variant="secondary" appearance="outline">Open popover</Button>}>
      <div className="w-64 space-y-1">
        <p className="font-medium">Quick info</p>
        <p className="text-sm text-muted-foreground">
          Popovers can hold any content — text, forms, menus.
        </p>
      </div>
    </Popover>
  );
}`,
      },
    },
  },
};
