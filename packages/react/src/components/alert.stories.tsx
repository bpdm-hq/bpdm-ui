import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { useState } from "react";
import { Alert } from "./alert";
import { Button } from "./button";

const usage = `
Inline, persistent alert — a colored left accent, a tinted icon, a title and body,
with optional actions and a dismiss button. Five variants
(\`default\`, \`info\`, \`success\`, \`warning\`, \`error\`), theme-aware across all themes.
For transient pop-up notifications use \`toast\` / \`<Toaster>\` instead.

\`\`\`tsx
import { Alert } from "@bpdm/ui";

<Alert variant="warning" title="Approaching seat limit">
  Your workspace is using 18 of 20 member seats.
</Alert>
\`\`\`
`;

const meta: Meta<typeof Alert> = {
  title: "Feedback/Alert",
  component: Alert,
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
    variant: {
      control: "inline-radio",
      options: ["default", "info", "success", "warning", "error"],
    },
    title: { control: "text" },
    children: { control: "text" },
  },
  args: {
    variant: "info",
    title: "Scheduled maintenance",
    children: "The deploy pipeline will be paused on Saturday, 02:00–03:00 UTC.",
  },
  render: (args) => (
    <div className="w-full max-w-xl">
      <Alert {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Alert>;

export const Playground: Story = {};

// all five variants stacked
export const Variants: Story = {
  render: () => (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Alert variant="info" title="Scheduled maintenance">
        The deploy pipeline will be paused on Saturday, 02:00–03:00 UTC.
      </Alert>
      <Alert variant="success" title="Deployment complete">
        Build #482 is live in production.
      </Alert>
      <Alert variant="warning" title="Approaching seat limit">
        Your workspace is using 18 of 20 member seats.
      </Alert>
      <Alert variant="error" title="Build failed">
        3 checks failed on the latest commit. Review the logs to continue.
      </Alert>
      <Alert variant="default" title="Heads up">
        Two-factor authentication is recommended for every team member.
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Alert } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Alert variant="info" title="Scheduled maintenance">
        The deploy pipeline will be paused on Saturday, 02:00–03:00 UTC.
      </Alert>
      <Alert variant="success" title="Deployment complete">
        Build #482 is live in production.
      </Alert>
      <Alert variant="warning" title="Approaching seat limit">
        Your workspace is using 18 of 20 member seats.
      </Alert>
      <Alert variant="error" title="Build failed">
        3 checks failed on the latest commit. Review the logs to continue.
      </Alert>
      <Alert variant="default" title="Heads up">
        Two-factor authentication is recommended for every team member.
      </Alert>
    </div>
  );
}`,
      },
    },
  },
};

// title + body + action buttons
export const WithActions: Story = {
  render: () => (
    <div className="w-full max-w-xl">
      <Alert
        variant="warning"
        title="Approaching seat limit"
        action={
          <>
            <Button size="sm">Upgrade plan</Button>
            <Button size="sm" variant="secondary" appearance="ghost">
              Manage members
            </Button>
          </>
        }
      >
        Your workspace is using 18 of 20 member seats. Upgrade to add more.
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Alert, Button } from "@bpdm/ui";

export function Example() {
  return (
    <Alert
      variant="warning"
      title="Approaching seat limit"
      action={
        <>
          <Button size="sm">Upgrade plan</Button>
          <Button size="sm" variant="secondary" appearance="ghost">Manage members</Button>
        </>
      }
    >
      Your workspace is using 18 of 20 member seats. Upgrade to add more.
    </Alert>
  );
}`,
      },
    },
  },
};

// dismissable via onClose
export const Dismissible: Story = {
  tags: ["!dev"],
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div className="w-full max-w-xl">
        {open ? (
          <Alert
            variant="success"
            title="Invite sent"
            onClose={() => setOpen(false)}
          >
            We emailed an invitation to the new project member.
          </Alert>
        ) : (
          <Button variant="secondary" appearance="ghost" onClick={() => setOpen(true)}>
            Show alert again
          </Button>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { Alert, Button } from "@bpdm/ui";

export function Example() {
  const [open, setOpen] = useState(true);
  return open ? (
    <Alert variant="success" title="Invite sent" onClose={() => setOpen(false)}>
      We emailed an invitation to the new project member.
    </Alert>
  ) : (
    <Button variant="secondary" appearance="ghost" onClick={() => setOpen(true)}>
      Show alert again
    </Button>
  );
}`,
      },
    },
  },
};

// title only, no body
export const TitleOnly: Story = {
  tags: ["!dev"],
  args: { variant: "info", title: "Your changes have been saved.", children: undefined },
  parameters: {
    docs: {
      source: {
        code: `import { Alert } from "@bpdm/ui";

export function Example() {
  return <Alert variant="info" title="Your changes have been saved." />;
}`,
      },
    },
  },
};

// hide the leading icon
export const NoIcon: Story = {
  tags: ["!dev"],
  args: {
    variant: "default",
    icon: null,
    title: "Release notes",
    children: "Version 2.4 adds keyboard navigation across the whole console.",
  },
  parameters: {
    docs: {
      source: {
        code: `import { Alert } from "@bpdm/ui";

export function Example() {
  return (
    <Alert variant="default" icon={null} title="Release notes">
      Version 2.4 adds keyboard navigation across the whole console.
    </Alert>
  );
}`,
      },
    },
  },
};
