import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import {
  Clock,
  DollarSign,
  RotateCcw,
  ShoppingCart,
  TrendingDown,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { StatCard } from "./stat-card";

const usage = `
Dashboard KPI / stat card — a label, a big value, and an optional percentage delta
coloured green/red by whether the change is good. For metrics where an increase is
bad (e.g. churn), set \`positiveIsGood={false}\`.

\`\`\`tsx
import { StatCard } from "@bpdm/ui";

<StatCard label="Revenue" value="$124,592" delta={12.5} deltaLabel="vs last month" />
<StatCard label="Churn rate" value="2.4%" delta={0.6} positiveIsGood={false} />
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
    label: "Revenue",
    value: "$124,592",
    delta: 12.5,
    deltaLabel: "vs last month",
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

// a typical dashboard row — note churn uses positiveIsGood={false}
export const Dashboard: Story = {
  parameters: {
    docs: {
      source: {
        code: `<StatCard label="Revenue" value="$124,592" delta={12.5} deltaLabel="vs last month" icon={<DollarSign />} />
<StatCard label="Active users" value="8,420" delta={3.1} deltaLabel="vs last week" icon={<Users />} />
<StatCard label="Churn rate" value="2.4%" delta={0.6} positiveIsGood={false} icon={<TrendingDown />} />
<StatCard label="Avg order value" value="$86.20" delta={-1.8} deltaLabel="vs last month" icon={<ShoppingCart />} />`,
      },
    },
  },
  render: () => (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
      <StatCard label="Revenue" value="$124,592" delta={12.5} deltaLabel="vs last month" icon={<DollarSign />} />
      <StatCard label="Active users" value="8,420" delta={3.1} deltaLabel="vs last week" icon={<Users />} />
      <StatCard label="Churn rate" value="2.4%" delta={0.6} positiveIsGood={false} deltaLabel="vs last month" icon={<TrendingDown />} />
      <StatCard label="Avg order value" value="$86.20" delta={-1.8} deltaLabel="vs last month" icon={<ShoppingCart />} />
    </div>
  ),
};

// custom accent colors — tinted card + matching icon badge (compact, no delta)
export const Colored: Story = {
  parameters: {
    docs: {
      source: {
        code: `<StatCard label="Settled Volume" value="$1.24M" accent="#0d9488" icon={<Wallet />} />
<StatCard label="Pending Payouts" value="$84.3K" accent="#d97706" icon={<Clock />} />
<StatCard label="Refund Rate" value="1.8%" accent="#e11d48" icon={<RotateCcw />} />
<StatCard label="New Customers" value="1,294" accent="#2563eb" icon={<UserPlus />} />`,
      },
    },
  },
  render: () => (
    <div className="grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Settled Volume" value="$1.24M" accent="#0d9488" icon={<Wallet />} />
      <StatCard label="Pending Payouts" value="$84.3K" accent="#d97706" icon={<Clock />} />
      <StatCard label="Refund Rate" value="1.8%" accent="#e11d48" icon={<RotateCcw />} />
      <StatCard label="New Customers" value="1,294" accent="#2563eb" icon={<UserPlus />} />
    </div>
  ),
};

export const NoDelta: Story = {
  parameters: {
    docs: { source: { code: `<StatCard label="Open tickets" value="37" />` } },
  },
  render: () => (
    <div className="w-72">
      <StatCard label="Open tickets" value="37" />
    </div>
  ),
};
