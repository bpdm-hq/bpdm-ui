import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { Dialog, DialogClose } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Select } from "./select";
import { MultiSelect } from "./multi-select";
import { TreeSelect } from "./tree-select";

const usage = `
Modal dialog built on an accessible primitive — focus trap, scroll lock, ESC and
outside-click to close, and full ARIA, all handled. Low-config: pass a \`trigger\`,
\`title\`, body, and \`footer\`. For full control compose \`DialogRoot\` /
\`DialogContent\` / \`DialogHeader\` / \`DialogFooter\`. Theme-aware, portaled,
enter/exit animated.

\`\`\`tsx
import { Dialog, DialogClose } from "@bpdm/ui";

<Dialog
  trigger={<Button>Edit</Button>}
  title="Edit project"
  description="Update the project details."
  footer={<>
    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
    <Button>Save</Button>
  </>}
>
  <Input defaultValue="Q3 Planning" />
</Dialog>
\`\`\`
`;

const meta: Meta<typeof Dialog> = {
  title: "Overlay/Dialog",
  component: Dialog,
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
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    showClose: { control: "boolean" },
    title: { control: "text" },
    description: { control: "text" },
    trigger: { table: { disable: true } },
    footer: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    title: "Edit project",
    description: "Update the project details.",
    size: "md",
  },
  render: (args) => (
    <Dialog
      {...args}
      trigger={<Button>Edit project</Button>}
      footer={
        <>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save changes</Button>
          </DialogClose>
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
          <Input defaultValue="Maya Patel" />
        </div>
      </div>
    </Dialog>
  ),
};
export default meta;

type Story = StoryObj<typeof Dialog>;

export const Playground: Story = {};

export const Sizes: Story = {
  parameters: {
    docs: { source: { code: `<Dialog size="sm" | "md" | "lg" | "xl" …>` } },
  },
  render: () => (
    <div className="flex flex-wrap gap-3">
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <Dialog
          key={size}
          size={size}
          title={`Size: ${size}`}
          description="The panel width adapts to the size prop."
          trigger={
            <Button variant="outline" className="uppercase">
              {size}
            </Button>
          }
          footer={
            <DialogClose asChild>
              <Button>Got it</Button>
            </DialogClose>
          }
        >
          <p className="text-sm text-muted-foreground">Dialog body content.</p>
        </Dialog>
      ))}
    </div>
  ),
};

// Select / MultiSelect / TreeSelect all work inside the dialog: each dropdown
// portals into the dialog, so it stays clickable + scrollable and never changes
// the dialog's height. The dropdowns are height-capped so the scroll is visible.
export const WithDropdowns: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Dialog size="sm" title="New project" trigger={<Button>New project</Button>}>
  <Select options={visibility} maxHeight={150} searchable />
  <MultiSelect options={labels} maxHeight={150} searchable />
  <TreeSelect options={categories} maxHeight={170} searchable />
</Dialog>`,
      },
    },
  },
  render: () => {
    const Demo = () => {
      const [visibility, setVisibility] = useState("team");
      const [labels, setLabels] = useState<string[]>(["frontend"]);
      const [cats, setCats] = useState<string[]>([]);
      return (
        <Dialog
          size="sm"
          title="New project"
          description="Every dropdown portals into the dialog — clickable, scrollable, no height change."
          trigger={<Button>New project</Button>}
          footer={
            <>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button>Create</Button>
              </DialogClose>
            </>
          }
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Visibility</label>
              <Select
                maxHeight={150}
                searchable
                value={visibility}
                onValueChange={setVisibility}
                options={[
                  { value: "private", label: "Private" },
                  { value: "team", label: "Team" },
                  { value: "org", label: "Organization" },
                  { value: "public", label: "Public" },
                  { value: "archived", label: "Archived" },
                  { value: "draft", label: "Draft" },
                  { value: "template", label: "Template" },
                  { value: "shared", label: "Shared" },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Labels</label>
              <MultiSelect
                maxHeight={150}
                searchable
                value={labels}
                onValueChange={setLabels}
                placeholder="Add labels"
                options={[
                  { value: "frontend", label: "Frontend" },
                  { value: "backend", label: "Backend" },
                  { value: "design", label: "Design" },
                  { value: "docs", label: "Docs" },
                  { value: "bug", label: "Bug" },
                  { value: "research", label: "Research" },
                ]}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category</label>
              <TreeSelect
                maxHeight={170}
                searchable
                value={cats}
                onValueChange={setCats}
                placeholder="Pick categories"
                options={[
                  {
                    value: "engineering",
                    label: "Engineering",
                    children: [
                      { value: "web", label: "Web" },
                      { value: "mobile", label: "Mobile" },
                      { value: "infra", label: "Infrastructure" },
                    ],
                  },
                  {
                    value: "product",
                    label: "Product",
                    children: [
                      { value: "design", label: "Design" },
                      { value: "research", label: "Research" },
                    ],
                  },
                ]}
              />
            </div>
          </div>
        </Dialog>
      );
    };
    return <Demo />;
  },
};

// tall body scrolls inside the dialog; header + footer stay fixed
export const ScrollableContent: Story = {
  parameters: {
    docs: { source: { code: `// body taller than 85dvh scrolls; header/footer stay put` } },
  },
  render: () => (
    <Dialog
      title="Terms of service"
      description="Please review before continuing."
      trigger={<Button variant="outline">Open long content</Button>}
      footer={
        <DialogClose asChild>
          <Button>Accept</Button>
        </DialogClose>
      }
    >
      <div className="space-y-3 text-sm text-muted-foreground">
        {Array.from({ length: 14 }, (_, i) => (
          <p key={i}>
            {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    </Dialog>
  ),
};

// drive `open` yourself — no trigger needed
export const Controlled: Story = {
  parameters: {
    docs: {
      source: {
        code: `const [open, setOpen] = useState(false);
<Button onClick={() => setOpen(true)}>Open</Button>
<Dialog open={open} onOpenChange={setOpen} title="…">…</Dialog>`,
      },
    },
  },
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open controlled</Button>
          <Dialog
            open={open}
            onOpenChange={setOpen}
            title="Controlled dialog"
            description="Its open state lives in the parent."
            footer={<Button onClick={() => setOpen(false)}>Close</Button>}
          >
            <p className="text-sm text-muted-foreground">
              Useful when opening from a menu, after an async action, etc.
            </p>
          </Dialog>
        </>
      );
    };
    return <Demo />;
  },
};
