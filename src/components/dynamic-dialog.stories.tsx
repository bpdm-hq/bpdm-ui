import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { DialogProvider, useDialog } from "./dynamic-dialog";
import { Button } from "./button";
import { Input } from "./input";

const usage = `
Open dialogs with arbitrary content from anywhere — no per-dialog open state or
prop drilling. Wrap the app in \`<DialogProvider>\`, then \`useDialog().open(...)\`.
Content can be a node or a function that receives \`close\`. Supports stacking.

\`\`\`tsx
import { DialogProvider, useDialog } from "@bpdm/ui";

// app root
<DialogProvider><App /></DialogProvider>

// anywhere
const dialog = useDialog();
dialog.open(({ close }) => <EditForm onDone={close} />, { title: "Edit" });
\`\`\`
`;

const meta: Meta<typeof DialogProvider> = {
  title: "Overlay/DynamicDialog",
  component: DialogProvider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: { component: usage },
      page: () => (
        <>
          <Title />
          <Description />
          <h2>Examples</h2>
          <Primary />
          <Controls />
          <Stories includePrimary={false} />
        </>
      ),
    },
  },
};
export default meta;

type Story = StoryObj<typeof DialogProvider>;

function Demo() {
  const dialog = useDialog();
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() =>
          dialog.open(
            ({ close }) => (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Name</label>
                  <Input defaultValue="Q3 Planning" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={close}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={close}>
                    Save
                  </Button>
                </div>
              </div>
            ),
            { title: "Edit project", description: "Opened imperatively from code." },
          )
        }
      >
        Edit project
      </Button>

      <Button
        variant="outline"
        onClick={() =>
          dialog.open(
            ({ close }) => (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Stack another dialog on top, then open more from here.
                </p>
                <Button size="sm" onClick={close}>
                  Got it
                </Button>
              </div>
            ),
            { title: "Stacked dialog", size: "sm" },
          )
        }
      >
        Open stacked
      </Button>
    </div>
  );
}

export const Basic: Story = {
  parameters: {
    docs: {
      source: {
        code: `const dialog = useDialog();

<Button
  onClick={() =>
    dialog.open(
      ({ close }) => (
        <form className="space-y-3">
          <Input defaultValue="Q3 Planning" />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={close}>Cancel</Button>
            <Button size="sm" onClick={close}>Save</Button>
          </div>
        </form>
      ),
      { title: "Edit project", description: "Opened imperatively from code." },
    )
  }
>
  Edit project
</Button>`,
      },
    },
  },
  render: () => (
    <DialogProvider>
      <Demo />
    </DialogProvider>
  ),
};
