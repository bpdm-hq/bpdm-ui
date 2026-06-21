import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { ConfirmProvider, useConfirm } from "./confirm-dialog";
import { Button } from "./button";

const usage = `
Imperative confirmation. Wrap the app in \`<ConfirmProvider>\` once, then call
\`const confirm = useConfirm()\` anywhere and \`await\` it — no per-action Dialog or
open-state boilerplate. Resolves \`true\` on confirm, \`false\` on cancel / ESC /
outside-click.

\`\`\`tsx
import { ConfirmProvider, useConfirm } from "@bpdm/ui";

// app root
<ConfirmProvider><App /></ConfirmProvider>

// anywhere
const confirm = useConfirm();
const ok = await confirm({
  title: "Delete project?",
  description: "This can't be undone.",
  destructive: true,
  confirmText: "Delete",
});
if (ok) remove();
\`\`\`
`;

const meta: Meta<typeof ConfirmProvider> = {
  title: "Overlay/ConfirmDialog",
  component: ConfirmProvider,
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

type Story = StoryObj<typeof ConfirmProvider>;

function DeleteDemo() {
  const confirm = useConfirm();
  const [result, setResult] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="destructive"
        onClick={async () => {
          const ok = await confirm({
            title: "Delete project?",
            description: "This permanently removes the project and its data.",
            destructive: true,
            confirmText: "Delete",
          });
          setResult(ok ? "Deleted ✓" : "Cancelled");
        }}
      >
        Delete project
      </Button>
      {result && <span className="text-sm text-muted-foreground">{result}</span>}
    </div>
  );
}

export const Destructive: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Button, ConfirmProvider, useConfirm } from "@bpdm/ui";

function DeleteButton() {
  const confirm = useConfirm();
  return (
    <Button
      variant="destructive"
      onClick={async () => {
        const ok = await confirm({
          title: "Delete project?",
          description: "This permanently removes the project and its data.",
          destructive: true,
          confirmText: "Delete",
        });
        if (ok) deleteProject();
      }}
    >
      Delete project
    </Button>
  );
}

export function Example() {
  return (
    <ConfirmProvider>
      <DeleteButton />
    </ConfirmProvider>
  );
}`,
      },
    },
  },
  render: () => (
    <ConfirmProvider>
      <DeleteDemo />
    </ConfirmProvider>
  ),
};

function PublishDemo() {
  const confirm = useConfirm();
  const [result, setResult] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={async () => {
          const ok = await confirm({
            title: "Publish changes?",
            description: "Your edits will go live immediately.",
            confirmText: "Publish",
          });
          setResult(ok ? "Published ✓" : "Kept as draft");
        }}
      >
        Publish
      </Button>
      {result && <span className="text-sm text-muted-foreground">{result}</span>}
    </div>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Button, ConfirmProvider, useConfirm } from "@bpdm/ui";

function PublishButton() {
  const confirm = useConfirm();
  return (
    <Button
      onClick={async () => {
        const ok = await confirm({
          title: "Publish changes?",
          description: "Your edits will go live immediately.",
          confirmText: "Publish",
        });
        if (ok) publish();
      }}
    >
      Publish
    </Button>
  );
}

export function Example() {
  return (
    <ConfirmProvider>
      <PublishButton />
    </ConfirmProvider>
  );
}`,
      },
    },
  },
  render: () => (
    <ConfirmProvider>
      <PublishDemo />
    </ConfirmProvider>
  ),
};
