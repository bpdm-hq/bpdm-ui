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
Vertical status timeline for lifecycles — deployments, approvals, onboarding, builds.
Each step has a status: \`complete\` (✓), \`current\` (pulsing), \`pending\` (hollow),
\`failed\` (✗), with an optional timestamp and description.

\`\`\`tsx
import { StatusTimeline } from "@bpdm/ui";

<StatusTimeline
  items={[
    { title: "Build queued", status: "complete", timestamp: "09:41" },
    { title: "Running tests", status: "current", timestamp: "09:42" },
    { title: "Deploy", status: "pending" },
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

const pipeline: TimelineItem[] = [
  { title: "Build queued", status: "complete", timestamp: "09:41", description: "Triggered by push to main" },
  { title: "Dependencies installed", status: "complete", timestamp: "09:41" },
  { title: "Running tests", status: "current", timestamp: "09:42", description: "412 of 980 passed" },
  { title: "Deploy to production", status: "pending", description: "Waiting for tests" },
];

export const Playground: Story = { args: { items: pipeline } };

// a flow that hit a failure
export const WithFailure: Story = {
  parameters: {
    docs: {
      source: {
        code: `<StatusTimeline items={[
  { title: "Tests passed", status: "complete" },
  { title: "Deploy failed", status: "failed", description: "Health check timed out" },
  { title: "Rollback scheduled", status: "pending" },
]} />`,
      },
    },
  },
  render: () => (
    <div className="w-80">
      <StatusTimeline
        items={[
          { title: "Tests passed", status: "complete", timestamp: "11:02" },
          { title: "Deploy failed", status: "failed", timestamp: "11:03", description: "Health check timed out" },
          { title: "Rollback scheduled", status: "pending", description: "Retrying in 5 min" },
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
