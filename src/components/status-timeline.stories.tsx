import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { StatusTimeline, type TimelineItem } from "./status-timeline";

const usage = `
Vertical status timeline for lifecycles — payments, orders, shipments, approvals.
Each step has a status: \`complete\` (✓), \`current\` (pulsing), \`pending\` (hollow),
\`failed\` (✗), with an optional timestamp and description.

\`\`\`tsx
import { StatusTimeline } from "@bpdm/ui";

<StatusTimeline
  items={[
    { title: "Order placed", status: "complete", timestamp: "09:41" },
    { title: "Payment captured", status: "current", timestamp: "09:42" },
    { title: "Settled", status: "pending" },
  ]}
/>
\`\`\`
`;

const meta: Meta<typeof StatusTimeline> = {
  title: "Data Display/StatusTimeline",
  component: StatusTimeline,
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
  argTypes: { items: { table: { disable: true } } },
  render: (args) => (
    <div className="w-80">
      <StatusTimeline {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof StatusTimeline>;

const payment: TimelineItem[] = [
  { title: "Order placed", status: "complete", timestamp: "09:41", description: "by customer" },
  { title: "Payment authorized", status: "complete", timestamp: "09:41" },
  { title: "Funds captured", status: "current", timestamp: "09:42", description: "Processing with acquirer" },
  { title: "Settled to account", status: "pending", description: "Expected in 2 business days" },
];

export const Playground: Story = { args: { items: payment } };

// a flow that hit a failure (e.g. a chargeback / declined capture)
export const WithFailure: Story = {
  parameters: {
    docs: {
      source: {
        code: `<StatusTimeline items={[
  { title: "Payment authorized", status: "complete" },
  { title: "Capture declined", status: "failed", description: "Insufficient funds" },
  { title: "Retry scheduled", status: "pending" },
]} />`,
      },
    },
  },
  render: () => (
    <div className="w-80">
      <StatusTimeline
        items={[
          { title: "Payment authorized", status: "complete", timestamp: "11:02" },
          { title: "Capture declined", status: "failed", timestamp: "11:03", description: "Insufficient funds" },
          { title: "Retry scheduled", status: "pending", description: "Tomorrow, 09:00" },
        ]}
      />
    </div>
  ),
};

// all four statuses
export const Statuses: Story = {
  parameters: {
    docs: {
      source: {
        code: `// status: "complete" | "current" | "pending" | "failed"`,
      },
    },
  },
  render: () => (
    <div className="w-80">
      <StatusTimeline
        items={[
          { title: "Complete step", status: "complete" },
          { title: "Current step", status: "current" },
          { title: "Failed step", status: "failed" },
          { title: "Pending step", status: "pending" },
        ]}
      />
    </div>
  ),
};
