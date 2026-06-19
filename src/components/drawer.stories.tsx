import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { Drawer, DrawerClose } from "./drawer";
import { Button } from "./button";
import { Input } from "./input";
import { Select } from "./select";

const usage = `
Slide-in panel ("sheet") built on an accessible primitive — focus trap, scroll
lock, ESC and outside-click to close. Slides in from any edge. Low-config: pass a
\`trigger\`, \`side\`, \`title\`, body, and \`footer\`. For full control compose
\`DrawerRoot\` / \`DrawerContent\` / \`DrawerHeader\` / \`DrawerFooter\`.

\`\`\`tsx
import { Drawer, DrawerClose } from "@bpdm/ui";

<Drawer
  side="right"
  trigger={<Button>Open</Button>}
  title="Edit project"
  footer={<>
    <DrawerClose asChild><Button variant="ghost">Cancel</Button></DrawerClose>
    <Button>Save</Button>
  </>}
>
  <Input defaultValue="Q3 Planning" />
</Drawer>
\`\`\`
`;

const meta: Meta<typeof Drawer> = {
  title: "Overlay/Drawer",
  component: Drawer,
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
    side: { control: "inline-radio", options: ["left", "right", "top", "bottom"] },
    size: { control: "select", options: ["sm", "md", "lg", "xl", "full"] },
    showClose: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
    trigger: { table: { disable: true } },
    footer: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    side: "right",
    size: "md",
    title: "Edit project",
    description: "Update the project details.",
  },
  render: (args) => (
    <Drawer
      {...args}
      trigger={<Button>Open drawer</Button>}
      footer={
        <>
          <DrawerClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button>Save changes</Button>
          </DrawerClose>
        </>
      }
    >
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Name</label>
          <Input defaultValue="Q3 Planning" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Owner</label>
          <Input defaultValue="Elena Costa" />
        </div>
      </div>
    </Drawer>
  ),
};
export default meta;

type Story = StoryObj<typeof Drawer>;

export const Playground: Story = {};

export const Sides: Story = {
  parameters: {
    docs: {
      source: {
        code: `{(["left", "right", "top", "bottom"] as const).map((side) => (
  <Drawer
    key={side}
    side={side}
    title={\`\${side} drawer\`}
    description={\`Slides in from the \${side}.\`}
    trigger={
      <Button variant="outline" className="capitalize">
        {side}
      </Button>
    }
    footer={
      <DrawerClose asChild>
        <Button>Done</Button>
      </DrawerClose>
    }
  >
    <p className="text-sm text-muted-foreground">Drawer body content.</p>
  </Drawer>
))}`,
      },
    },
  },
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(["left", "right", "top", "bottom"] as const).map((side) => (
        <Drawer
          key={side}
          side={side}
          title={`${side} drawer`}
          description={`Slides in from the ${side}.`}
          trigger={
            <Button variant="outline" className="capitalize">
              {side}
            </Button>
          }
          footer={
            <DrawerClose asChild>
              <Button>Done</Button>
            </DrawerClose>
          }
        >
          <p className="text-sm text-muted-foreground">Drawer body content.</p>
        </Drawer>
      ))}
    </div>
  ),
};

// dropdowns work inside the drawer too — Select portals into it (stays clickable)
export const WithForm: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Drawer side="right" title="New project" trigger={<Button>New project</Button>}>
  <Input defaultValue="Q3 Planning" />
  <Select options={visibility} value={value} onValueChange={setValue} searchable />
</Drawer>`,
      },
    },
  },
  render: () => {
    const Demo = () => {
      const [visibility, setVisibility] = useState("team");
      return (
        <Drawer
          side="right"
          title="New project"
          description="Dropdowns portal into the drawer — fully clickable."
          trigger={<Button>New project</Button>}
          footer={
            <>
              <DrawerClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button>Create</Button>
              </DrawerClose>
            </>
          }
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <Input defaultValue="Q3 Planning" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Visibility</label>
              <Select
                searchable
                value={visibility}
                onValueChange={setVisibility}
                options={[
                  { value: "private", label: "Private" },
                  { value: "team", label: "Team" },
                  { value: "org", label: "Organization" },
                  { value: "public", label: "Public" },
                ]}
              />
            </div>
          </div>
        </Drawer>
      );
    };
    return <Demo />;
  },
};

export const Controlled: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `const [open, setOpen] = useState(false);

<>
  <Button onClick={() => setOpen(true)}>Open controlled</Button>
  <Drawer
    open={open}
    onOpenChange={setOpen}
    title="Controlled drawer"
    description="Its open state lives in the parent."
    footer={<Button onClick={() => setOpen(false)}>Close</Button>}
  >
    <p className="text-sm text-muted-foreground">
      Open it from a menu, after an async action, etc.
    </p>
  </Drawer>
</>`,
      },
    },
  },
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open controlled</Button>
          <Drawer
            open={open}
            onOpenChange={setOpen}
            title="Controlled drawer"
            description="Its open state lives in the parent."
            footer={<Button onClick={() => setOpen(false)}>Close</Button>}
          >
            <p className="text-sm text-muted-foreground">
              Open it from a menu, after an async action, etc.
            </p>
          </Drawer>
        </>
      );
    };
    return <Demo />;
  },
};
