import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { Briefcase, User } from "lucide-react";
import { Tabs } from "./tabs";

const usage = `
Tabs built on an accessible primitive (roving focus, arrow-key nav). Two looks —
\`underline\` (a line indicator under the active tab, tabs sized to content) and
\`pill\` (a filled active tab). Data-driven via \`items\`, or compose
\`TabsRoot\`/\`TabsList\`/\`TabsTrigger\`/\`TabsContent\`. Controlled or uncontrolled;
supports icons, disabled tabs, and \`fullWidth\`.

\`\`\`tsx
import { Tabs } from "@bpdm/ui";

<Tabs
  variant="underline"
  items={[
    { value: "account", label: "Account", content: <AccountPanel /> },
    { value: "team", label: "Team", content: <TeamPanel /> },
  ]}
/>
\`\`\`
`;

const meta: Meta<typeof Tabs> = {
  title: "Navigation/Tabs",
  component: Tabs,
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
    variant: { control: "inline-radio", options: ["underline", "pill"] },
    baseline: { control: "inline-radio", options: ["full", "content"] },
    fullWidth: { control: "boolean" },
    items: { table: { disable: true } },
  },
  args: {
    variant: "underline",
    items: [
      { value: "overview", label: "Overview", content: <Panel>Project overview and highlights.</Panel> },
      { value: "activity", label: "Activity", content: <Panel>Recent activity and events.</Panel> },
      { value: "members", label: "Members", content: <Panel>People with access and their roles.</Panel> },
      { value: "integrations", label: "Integrations", content: <Panel>Connected apps and services.</Panel> },
      { value: "settings", label: "Settings", content: <Panel>Project preferences.</Panel> },
    ],
  },
  render: (args) => (
    <div className="w-full max-w-3xl">
      <Tabs {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Tabs>;

function Panel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export const Underline: Story = {};

// the underline track ends with the last tab instead of spanning the row
export const ContentBaseline: Story = {
  args: { baseline: "content" },
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `<Tabs
  variant="underline"
  baseline="content"
  items={[
    { value: "overview", label: "Overview", content: <Panel>Project overview and highlights.</Panel> },
    { value: "activity", label: "Activity", content: <Panel>Recent activity and events.</Panel> },
    { value: "members", label: "Members", content: <Panel>People with access and their roles.</Panel> },
    { value: "integrations", label: "Integrations", content: <Panel>Connected apps and services.</Panel> },
    { value: "settings", label: "Settings", content: <Panel>Project preferences.</Panel> },
  ]}
/>`,
      },
    },
  },
};

// filled active tab with icons (no underline)
export const Pill: Story = {
  args: {
    variant: "pill",
    items: [
      {
        value: "workspace",
        label: "Workspace",
        icon: <Briefcase />,
        content: <Panel>Workspace-wide preferences.</Panel>,
      },
      {
        value: "profile",
        label: "Profile",
        icon: <User />,
        content: <Panel>Your personal profile.</Panel>,
      },
    ],
  },
  parameters: {
    docs: {
      source: {
        code: `<Tabs
  variant="pill"
  items={[
    {
      value: "workspace",
      label: "Workspace",
      icon: <Briefcase />,
      content: <Panel>Workspace-wide preferences.</Panel>,
    },
    {
      value: "profile",
      label: "Profile",
      icon: <User />,
      content: <Panel>Your personal profile.</Panel>,
    },
  ]}
/>`,
      },
    },
  },
};

// tabs stretch to fill the row width equally
export const FullWidth: Story = {
  tags: ["!dev"],
  args: {
    fullWidth: true,
    items: [
      { value: "overview", label: "Overview", content: <Panel>Overview.</Panel> },
      { value: "activity", label: "Activity", content: <Panel>Activity.</Panel> },
      { value: "settings", label: "Settings", content: <Panel>Settings.</Panel> },
    ],
  },
  parameters: {
    docs: {
      source: {
        code: `<Tabs
  fullWidth
  items={[
    { value: "overview", label: "Overview", content: <Panel>Overview.</Panel> },
    { value: "activity", label: "Activity", content: <Panel>Activity.</Panel> },
    { value: "settings", label: "Settings", content: <Panel>Settings.</Panel> },
  ]}
/>`,
      },
    },
  },
};

export const DisabledTab: Story = {
  tags: ["!dev"],
  args: {
    items: [
      { value: "general", label: "General", content: <Panel>General.</Panel> },
      { value: "billing", label: "Billing", content: <Panel>Billing.</Panel> },
      { value: "danger", label: "Danger zone", disabled: true, content: <Panel>Danger.</Panel> },
    ],
  },
  parameters: {
    docs: { source: { code: `{ value: "danger", label: "Danger zone", disabled: true }` } },
  },
};
