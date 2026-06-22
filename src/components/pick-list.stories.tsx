import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { useState } from "react";
import { Activity, BarChart3, Clock, Gauge, Users } from "lucide-react";
import { PickList, type PickListValue } from "./pick-list";

const usage = `
Move items between two lists. Select items on either side and transfer them with the
middle controls (move / move all, each way); optionally reorder within each list
(drag or the side controls). Controlled (\`value\`) or uncontrolled, filterable, and
responsive — the lists stack on small screens. Reuses \`SelectableList\` (same body as
OrderList).

\`\`\`tsx
import { useState } from "react";
import { PickList, type PickListValue } from "@bpdm/ui";

export function Example() {
  const [lists, setLists] = useState<PickListValue<string>>({
    source: ["Traffic", "Revenue", "Sessions", "Uptime"],
    target: ["Overview"],
  });
  return (
    <PickList
      value={lists}
      onChange={setLists}
      itemKey={(w) => w}
      renderItem={(w) => w}
      sourceHeader="Available"
      targetHeader="Your dashboard"
    />
  );
}
\`\`\`
`;

type Widget = { id: string; name: string; category: string; icon: React.ReactNode };

const AVAILABLE: Widget[] = [
  { id: "traffic", name: "Traffic", category: "Analytics", icon: <Activity /> },
  { id: "revenue", name: "Revenue", category: "Finance", icon: <BarChart3 /> },
  { id: "sessions", name: "Active sessions", category: "Analytics", icon: <Clock /> },
  { id: "team", name: "Team activity", category: "People", icon: <Users /> },
  { id: "uptime", name: "Uptime", category: "Reliability", icon: <Activity /> },
];
const CHOSEN: Widget[] = [{ id: "overview", name: "Overview", category: "Summary", icon: <Gauge /> }];

const meta: Meta<typeof PickList<string>> = {
  title: "Data Display/PickList",
  component: PickList,
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

type Story = StoryObj<typeof PickList<string>>;

// plain string items
export const Basic: Story = {
  render: () => {
    const [lists, setLists] = useState<PickListValue<string>>({
      source: ["Traffic", "Revenue", "Active sessions", "Team activity", "Uptime"],
      target: ["Overview"],
    });
    return (
      <PickList
        value={lists}
        onChange={setLists}
        itemKey={(w) => w}
        renderItem={(w) => w}
        sourceHeader="Available"
        targetHeader="Your dashboard"
      />
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { PickList, type PickListValue } from "@bpdm/ui";

export function Example() {
  const [lists, setLists] = useState<PickListValue<string>>({
    source: ["Traffic", "Revenue", "Active sessions", "Team activity", "Uptime"],
    target: ["Overview"],
  });
  return (
    <PickList
      value={lists}
      onChange={setLists}
      itemKey={(w) => w}
      renderItem={(w) => w}
      sourceHeader="Available"
      targetHeader="Your dashboard"
    />
  );
}`,
      },
    },
  },
};

// filter both lists by name
export const WithFilter: Story = {
  render: () => {
    const [lists, setLists] = useState<PickListValue<Widget>>({ source: AVAILABLE, target: CHOSEN });
    return (
      <PickList
        value={lists}
        onChange={setLists}
        itemKey={(w) => w.id}
        filterBy={(w) => w.name}
        filterPlaceholder="Filter widgets"
        sourceHeader="Available"
        targetHeader="Your dashboard"
        renderItem={(w) => (
          <div className="flex items-center justify-between gap-3">
            <span>{w.name}</span>
            <span className="text-xs text-muted-foreground">{w.category}</span>
          </div>
        )}
      />
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { PickList, type PickListValue } from "@bpdm/ui";

type Widget = { id: string; name: string; category: string };

export function Example() {
  const [lists, setLists] = useState<PickListValue<Widget>>({
    source: [
      { id: "traffic", name: "Traffic", category: "Analytics" },
      { id: "revenue", name: "Revenue", category: "Finance" },
      { id: "sessions", name: "Active sessions", category: "Analytics" },
    ],
    target: [{ id: "overview", name: "Overview", category: "Summary" }],
  });
  return (
    <PickList
      value={lists}
      onChange={setLists}
      itemKey={(w) => w.id}
      filterBy={(w) => w.name}
      filterPlaceholder="Filter widgets"
      sourceHeader="Available"
      targetHeader="Your dashboard"
      renderItem={(w) => (
        <div className="flex items-center justify-between gap-3">
          <span>{w.name}</span>
          <span className="text-xs text-muted-foreground">{w.category}</span>
        </div>
      )}
    />
  );
}`,
      },
    },
  },
};

// rich item template with an icon + meta
export const Template: Story = {
  render: () => {
    const [lists, setLists] = useState<PickListValue<Widget>>({ source: AVAILABLE, target: CHOSEN });
    return (
      <PickList
        value={lists}
        onChange={setLists}
        itemKey={(w) => w.id}
        sourceHeader="Available"
        targetHeader="Your dashboard"
        renderItem={(w) => (
          <div className="flex items-center gap-3 [&_svg]:size-4 [&_svg]:text-muted-foreground">
            {w.icon}
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{w.name}</p>
              <p className="text-xs text-muted-foreground">{w.category}</p>
            </div>
          </div>
        )}
      />
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { Gauge, Activity, BarChart3 } from "lucide-react";
import { PickList, type PickListValue } from "@bpdm/ui";

type Widget = { id: string; name: string; category: string; icon: React.ReactNode };

export function Example() {
  const [lists, setLists] = useState<PickListValue<Widget>>({
    source: [
      { id: "traffic", name: "Traffic", category: "Analytics", icon: <Activity /> },
      { id: "revenue", name: "Revenue", category: "Finance", icon: <BarChart3 /> },
    ],
    target: [{ id: "overview", name: "Overview", category: "Summary", icon: <Gauge /> }],
  });
  return (
    <PickList
      value={lists}
      onChange={setLists}
      itemKey={(w) => w.id}
      sourceHeader="Available"
      targetHeader="Your dashboard"
      renderItem={(w) => (
        <div className="flex items-center gap-3 [&_svg]:size-4 [&_svg]:text-muted-foreground">
          {w.icon}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{w.name}</p>
            <p className="text-xs text-muted-foreground">{w.category}</p>
          </div>
        </div>
      )}
    />
  );
}`,
      },
    },
  },
};

// transfer-only: hide the reorder controls (and within-list drag)
export const TransferOnly: Story = {
  tags: ["!dev"],
  render: () => {
    const [lists, setLists] = useState<PickListValue<string>>({
      source: ["Traffic", "Revenue", "Active sessions", "Uptime"],
      target: ["Overview"],
    });
    return (
      <PickList
        value={lists}
        onChange={setLists}
        itemKey={(w) => w}
        renderItem={(w) => w}
        reorder={false}
        sourceHeader="Available"
        targetHeader="Your dashboard"
      />
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { PickList, type PickListValue } from "@bpdm/ui";

export function Example() {
  const [lists, setLists] = useState<PickListValue<string>>({
    source: ["Traffic", "Revenue", "Active sessions", "Uptime"],
    target: ["Overview"],
  });
  return (
    <PickList
      value={lists}
      onChange={setLists}
      itemKey={(w) => w}
      renderItem={(w) => w}
      reorder={false}
      sourceHeader="Available"
      targetHeader="Your dashboard"
    />
  );
}`,
      },
    },
  },
};
