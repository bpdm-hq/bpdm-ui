import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { StepDialog } from "./step-dialog";
import { Button } from "./button";
import { Input } from "./input";

const usage = `
Multi-step "wizard" dialog — a progress stepper, per-step content, and
Back / Next / Finish navigation. Built on the Dialog; the step resets when closed,
and \`onComplete\` fires on Finish.

\`\`\`tsx
import { StepDialog } from "@bpdm/ui";

<StepDialog
  trigger={<Button>Get started</Button>}
  title="Set up workspace"
  steps={[
    { title: "Account", description: "Your details", content: <AccountForm /> },
    { title: "Workspace", description: "Name it", content: <WorkspaceForm /> },
    { title: "Review", content: <Summary /> },
  ]}
  onComplete={() => save()}
/>
\`\`\`
`;

const meta: Meta<typeof StepDialog> = {
  title: "Overlay/StepDialog",
  component: StepDialog,
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
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
    title: { control: "text" },
    steps: { table: { disable: true } },
  },
};
export default meta;

type Story = StoryObj<typeof StepDialog>;

const Field = ({ label, defaultValue }: { label: string; defaultValue?: string }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium">{label}</label>
    <Input defaultValue={defaultValue} />
  </div>
);

export const Wizard: Story = {
  args: { title: "Set up workspace", size: "md" },
  parameters: {
    docs: {
      source: {
        code: `import { Button, Input, StepDialog } from "@bpdm/ui";

function Field({ label }: { label: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <Input />
    </div>
  );
}

export function Example() {
  return (
    <StepDialog
      trigger={<Button>Get started</Button>}
      title="Set up workspace"
      steps={[
        { title: "Account", description: "Your details",
          content: <><Field label="Full name" /><Field label="Email" /></> },
        { title: "Workspace", description: "Name your workspace",
          content: <Field label="Workspace name" /> },
        { title: "Review", description: "Confirm and finish",
          content: <p>Everything looks good. Click Finish to create it.</p> },
      ]}
      onComplete={() => createWorkspace()}
    />
  );
}`,
      },
    },
  },
  render: (args) => (
    <StepDialog
      {...args}
      trigger={<Button>Get started</Button>}
      onComplete={() => window.alert("Workspace created ✓")}
      steps={[
        {
          title: "Account",
          description: "Tell us about you.",
          content: (
            <div className="space-y-3">
              <Field label="Full name" defaultValue="Marco Rossi" />
              <Field label="Email" defaultValue="marco@example.com" />
            </div>
          ),
        },
        {
          title: "Workspace",
          description: "Name your workspace.",
          content: (
            <div className="space-y-3">
              <Field label="Workspace name" defaultValue="Acme" />
              <Field label="URL slug" defaultValue="acme" />
            </div>
          ),
        },
        {
          title: "Review",
          description: "Confirm and finish.",
          content: (
            <p className="text-sm text-muted-foreground">
              Everything looks good. Click <strong>Finish</strong> to create your workspace.
            </p>
          ),
        },
      ]}
    />
  ),
};
