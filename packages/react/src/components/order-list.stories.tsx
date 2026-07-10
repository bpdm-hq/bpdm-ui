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
import { OrderList } from "./order-list";

const usage = `
Reorder a collection: select one or more items, then move them with the control
column (up / to top / down / to bottom), or drag to reorder. Controlled (\`value\`)
or uncontrolled (\`defaultValue\`), optional filtering, custom item template, and
responsive — the controls sit beside the list and stack above it on small screens.
\`SelectableList\` (the list body) is exported so a future PickList can reuse it.

\`\`\`tsx
import { useState } from "react";
import { OrderList } from "@bpdm/ui";

export function Example() {
  const [items, setItems] = useState(["Overview", "Traffic", "Revenue", "Sessions"]);
  return (
    <OrderList
      value={items}
      onChange={setItems}
      itemKey={(w) => w}
      renderItem={(w) => w}
    />
  );
}
\`\`\`
`;

type Widget = { id: string; name: string; category: string; updated: string; icon: React.ReactNode };

const WIDGETS: Widget[] = [
  { id: "overview", name: "Overview", category: "Summary", updated: "2m ago", icon: <Gauge /> },
  { id: "traffic", name: "Traffic", category: "Analytics", updated: "5m ago", icon: <Activity /> },
  { id: "revenue", name: "Revenue", category: "Finance", updated: "1h ago", icon: <BarChart3 /> },
  { id: "sessions", name: "Active sessions", category: "Analytics", updated: "just now", icon: <Clock /> },
  { id: "team", name: "Team activity", category: "People", updated: "12m ago", icon: <Users /> },
  { id: "uptime", name: "Uptime", category: "Reliability", updated: "3m ago", icon: <Activity /> },
];

const meta: Meta<typeof OrderList<string>> = {
  title: "Data Display/OrderList",
  component: OrderList,
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

type Story = StoryObj<typeof OrderList<string>>;

// plain string items
export const Basic: Story = {
  render: () => {
    const [items, setItems] = useState(["Overview", "Traffic", "Revenue", "Sessions", "Team activity", "Uptime"]);
    return (
      <div className="w-80">
        <OrderList value={items} onChange={setItems} itemKey={(w) => w} renderItem={(w) => w} />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { OrderList } from "@bpdm/ui";

export function Example() {
  const [items, setItems] = useState([
    "Overview",
    "Traffic",
    "Revenue",
    "Sessions",
    "Team activity",
    "Uptime",
  ]);
  return (
    <div className="w-80">
      <OrderList value={items} onChange={setItems} itemKey={(w) => w} renderItem={(w) => w} />
    </div>
  );
}`,
      },
    },
  },
};

// filter the list by name
export const WithFilter: Story = {
  render: () => {
    const [items, setItems] = useState(WIDGETS);
    return (
      <div className="w-96">
        <OrderList
          value={items}
          onChange={setItems}
          itemKey={(w) => w.id}
          filterBy={(w) => w.name}
          filterPlaceholder="Filter widgets"
          renderItem={(w) => (
            <div className="flex items-center justify-between gap-3">
              <span>{w.name}</span>
              <span className="text-xs text-muted-foreground">{w.category}</span>
            </div>
          )}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { OrderList } from "@bpdm/ui";

type Widget = { id: string; name: string; category: string };

export function Example() {
  const [items, setItems] = useState<Widget[]>([
    { id: "overview", name: "Overview", category: "Summary" },
    { id: "traffic", name: "Traffic", category: "Analytics" },
    { id: "revenue", name: "Revenue", category: "Finance" },
    { id: "sessions", name: "Active sessions", category: "Analytics" },
  ]);
  return (
    <OrderList
      value={items}
      onChange={setItems}
      itemKey={(w) => w.id}
      filterBy={(w) => w.name}
      filterPlaceholder="Filter widgets"
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

// rich item template with an icon, title, meta + a header
export const Template: Story = {
  render: () => {
    const [items, setItems] = useState(WIDGETS);
    return (
      <div className="w-96">
        <OrderList
          value={items}
          onChange={setItems}
          itemKey={(w) => w.id}
          header="Dashboard widgets"
          renderItem={(w) => (
            <div className="flex items-center gap-3 [&_svg]:size-4 [&_svg]:text-muted-foreground">
              {w.icon}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{w.name}</p>
                <p className="text-xs text-muted-foreground">{w.category}</p>
              </div>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{w.updated}</span>
            </div>
          )}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { Gauge, Activity, BarChart3 } from "lucide-react";
import { OrderList } from "@bpdm/ui";

type Widget = { id: string; name: string; category: string; updated: string; icon: React.ReactNode };

export function Example() {
  const [items, setItems] = useState<Widget[]>([
    { id: "overview", name: "Overview", category: "Summary", updated: "2m ago", icon: <Gauge /> },
    { id: "traffic", name: "Traffic", category: "Analytics", updated: "5m ago", icon: <Activity /> },
    { id: "revenue", name: "Revenue", category: "Finance", updated: "1h ago", icon: <BarChart3 /> },
  ]);
  return (
    <OrderList
      value={items}
      onChange={setItems}
      itemKey={(w) => w.id}
      header="Dashboard widgets"
      renderItem={(w) => (
        <div className="flex items-center gap-3 [&_svg]:size-4 [&_svg]:text-muted-foreground">
          {w.icon}
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{w.name}</p>
            <p className="text-xs text-muted-foreground">{w.category}</p>
          </div>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{w.updated}</span>
        </div>
      )}
    />
  );
}`,
      },
    },
  },
};

// select several items and move them together with the control column
export const MultipleSelection: Story = {
  tags: ["!dev"],
  render: () => {
    const [items, setItems] = useState(["Overview", "Traffic", "Revenue", "Sessions", "Team activity", "Uptime"]);
    return (
      <div className="w-80">
        <OrderList
          value={items}
          onChange={setItems}
          itemKey={(w) => w}
          renderItem={(w) => w}
          selectionMode="multiple"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { OrderList } from "@bpdm/ui";

export function Example() {
  const [items, setItems] = useState([
    "Overview",
    "Traffic",
    "Revenue",
    "Sessions",
    "Team activity",
    "Uptime",
  ]);
  return (
    <OrderList
      value={items}
      onChange={setItems}
      itemKey={(w) => w}
      renderItem={(w) => w}
      selectionMode="multiple"
    />
  );
}`,
      },
    },
  },
};

// translate every screen-reader string via the `messages` prop
export const Internationalized: Story = {
  tags: ["!dev"],
  render: () => {
    const [items, setItems] = useState(["Analyse", "Compilation", "Tests", "Déploiement"]);
    return (
      <div className="w-80">
        <OrderList
          value={items}
          onChange={setItems}
          itemKey={(w) => w}
          renderItem={(w) => w}
          header="Étapes du pipeline"
          messages={{
            reorderGroup: "Réorganiser",
            moveUp: "Monter",
            moveToTop: "Placer en haut",
            moveDown: "Descendre",
            moveToBottom: "Placer en bas",
            movedUp: "Déplacé vers le haut",
            movedToTop: "Placé en haut",
            movedDown: "Déplacé vers le bas",
            movedToBottom: "Placé en bas",
            empty: "Aucun élément",
            listLabel: "Liste ordonnable",
          }}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { OrderList } from "@bpdm/ui";

export function Example() {
  const [items, setItems] = useState(["Analyse", "Compilation", "Tests", "Déploiement"]);
  return (
    <OrderList
      value={items}
      onChange={setItems}
      itemKey={(w) => w}
      renderItem={(w) => w}
      header="Étapes du pipeline"
      messages={{
        reorderGroup: "Réorganiser",
        moveUp: "Monter",
        moveToTop: "Placer en haut",
        moveDown: "Descendre",
        moveToBottom: "Placer en bas",
        movedUp: "Déplacé vers le haut",
        movedToTop: "Placé en haut",
        movedDown: "Déplacé vers le bas",
        movedToBottom: "Placé en bas",
        empty: "Aucun élément",
        listLabel: "Liste ordonnable",
      }}
    />
  );
}`,
      },
    },
  },
};

// drag-and-drop is on by default; set dragdrop={false} to disable
export const NoDragDrop: Story = {
  tags: ["!dev"],
  render: () => {
    const [items, setItems] = useState(["Overview", "Traffic", "Revenue", "Sessions"]);
    return (
      <div className="w-80">
        <OrderList
          value={items}
          onChange={setItems}
          itemKey={(w) => w}
          renderItem={(w) => w}
          dragdrop={false}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { OrderList } from "@bpdm/ui";

export function Example() {
  const [items, setItems] = useState(["Overview", "Traffic", "Revenue", "Sessions"]);
  return (
    <OrderList
      value={items}
      onChange={setItems}
      itemKey={(w) => w}
      renderItem={(w) => w}
      dragdrop={false}
    />
  );
}`,
      },
    },
  },
};
