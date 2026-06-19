import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import {
  Activity,
  Clock,
  Eye,
  TrendingDown,
  UserPlus,
  Users,
} from "lucide-react";
import { StatCard } from "./stat-card";

const usage = `
Dashboard KPI / stat card — a label, a big value, and an optional percentage delta
coloured green/red by whether the change is good. For metrics where an increase is
bad (e.g. churn), set \`positiveIsGood={false}\`.

\`\`\`tsx
import { StatCard } from "@bpdm/ui";

<StatCard label="Active users" value="8,420" delta={3.1} deltaLabel="vs last week" />
<StatCard label="Bounce rate" value="2.4%" delta={0.6} positiveIsGood={false} />
\`\`\`
`;

const meta: Meta<typeof StatCard> = {
  title: "Data Display/StatCard",
  component: StatCard,
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
    label: { control: "text" },
    value: { control: "text" },
    delta: { control: "number" },
    deltaLabel: { control: "text" },
    positiveIsGood: { control: "boolean" },
    accent: { control: "color" },
    icon: { table: { disable: true } },
  },
  args: {
    label: "Active users",
    value: "8,420",
    delta: 3.1,
    deltaLabel: "vs last week",
    positiveIsGood: true,
  },
  render: (args) => (
    <div className="w-72">
      <StatCard {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof StatCard>;

export const Playground: Story = {};

// a typical dashboard row — note bounce rate uses positiveIsGood={false}
export const Dashboard: Story = {
  parameters: {
    docs: {
      source: {
        code: `import { Clock, TrendingDown, UserPlus, Users } from "lucide-react";
import { StatCard } from "@bpdm/ui";

export function Example() {
  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
      <StatCard label="Active users" value="8,420" delta={3.1} deltaLabel="vs last week" icon={<Users />} />
      <StatCard label="New signups" value="1,294" delta={12.5} deltaLabel="vs last month" icon={<UserPlus />} />
      <StatCard label="Bounce rate" value="2.4%" delta={0.6} positiveIsGood={false} deltaLabel="vs last month" icon={<TrendingDown />} />
      <StatCard label="Avg. session" value="4m 12s" delta={-1.8} deltaLabel="vs last month" icon={<Clock />} />
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
      <StatCard label="Active users" value="8,420" delta={3.1} deltaLabel="vs last week" icon={<Users />} />
      <StatCard label="New signups" value="1,294" delta={12.5} deltaLabel="vs last month" icon={<UserPlus />} />
      <StatCard label="Bounce rate" value="2.4%" delta={0.6} positiveIsGood={false} deltaLabel="vs last month" icon={<TrendingDown />} />
      <StatCard label="Avg. session" value="4m 12s" delta={-1.8} deltaLabel="vs last month" icon={<Clock />} />
    </div>
  ),
};

// custom accent colors — tinted card + matching icon badge (compact, no delta)
export const Colored: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { Activity, Eye, TrendingDown, UserPlus } from "lucide-react";
import { StatCard } from "@bpdm/ui";

export function Example() {
  return (
    <div className="grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Page views" value="1.24M" accent="#2563eb" icon={<Eye />} />
      <StatCard label="Sessions" value="84.3K" accent="#0d9488" icon={<Activity />} />
      <StatCard label="Bounce rate" value="1.8%" accent="#e11d48" icon={<TrendingDown />} />
      <StatCard label="New signups" value="1,294" accent="#7c3aed" icon={<UserPlus />} />
    </div>
  );
}`,
      },
    },
  },
  render: () => (
    <div className="grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Page views" value="1.24M" accent="#2563eb" icon={<Eye />} />
      <StatCard label="Sessions" value="84.3K" accent="#0d9488" icon={<Activity />} />
      <StatCard label="Bounce rate" value="1.8%" accent="#e11d48" icon={<TrendingDown />} />
      <StatCard label="New signups" value="1,294" accent="#7c3aed" icon={<UserPlus />} />
    </div>
  ),
};

export const NoDelta: Story = {
  tags: ["!dev"],
  parameters: {
    docs: {
      source: {
        code: `import { StatCard } from "@bpdm/ui";

export function Example() {
  return <StatCard label="Open tickets" value="37" />;
}`,
      },
    },
  },
  render: () => (
    <div className="w-72">
      <StatCard label="Open tickets" value="37" />
    </div>
  ),
};
