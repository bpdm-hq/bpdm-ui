import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { useState } from "react";
import { Bell, Mail } from "lucide-react";
import { Badge, NotificationBadge, type BadgeVariant } from "./badge";
import { Button } from "./button";

const usage = `
Compact label for status, categories, counts and tags. Six semantic colors across
three appearances (\`soft\`, \`solid\`, \`outline\`), an optional status dot (with a
\`pulse\` for live states), and a removable mode that collapses + fades on remove.
\`NotificationBadge\` overlays a count or dot on the corner of an icon or button.

\`\`\`tsx
import { Badge, NotificationBadge } from "@bpdm/ui";

<Badge variant="success">Active</Badge>
<Badge variant="info" dot pulse>Deploying</Badge>
<Badge variant="neutral" onRemove={() => remove("frontend")}>Frontend</Badge>

<NotificationBadge count={8}><Bell /></NotificationBadge>
\`\`\`
`;

const VARIANTS: BadgeVariant[] = [
  "neutral",
  "primary",
  "success",
  "warning",
  "info",
  "destructive",
];

const meta: Meta<typeof Badge> = {
  title: "Data Display/Badge",
  component: Badge,
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
    variant: { control: "inline-radio", options: VARIANTS },
    appearance: { control: "inline-radio", options: ["soft", "solid", "outline", "ghost"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    dot: { control: "boolean" },
    pulse: { control: "boolean" },
    children: { control: "text" },
  },
  args: {
    variant: "success",
    appearance: "soft",
    size: "md",
    children: "Active",
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Playground: Story = {};

// every color across the three appearances
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(["soft", "solid", "outline"] as const).map((appearance) => (
        <div key={appearance} className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-xs text-muted-foreground">{appearance}</span>
          {VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant} appearance={appearance}>
              {variant}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Badge } from "@bpdm/ui";

export function Example() {
  return <Badge variant="success" appearance="soft">Active</Badge>;
}`,
      },
    },
  },
};

// leading dot — add `pulse` for live / in-progress states
export const StatusDots: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {/* soft pills with a dot */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="success" dot pulse>Live</Badge>
        <Badge variant="info" dot pulse>Deploying</Badge>
        <Badge variant="warning" dot>Degraded</Badge>
        <Badge variant="destructive" dot>Offline</Badge>
        <Badge variant="neutral" dot>Draft</Badge>
      </div>

      {/* `ghost` — bare dot + label, no chrome (for table cells / lists) */}
      <div className="flex flex-wrap items-center gap-5">
        <Badge appearance="ghost" variant="success" dot>Healthy</Badge>
        <Badge appearance="ghost" variant="info" dot pulse>Syncing</Badge>
        <Badge appearance="ghost" variant="warning" dot>Pending</Badge>
        <Badge appearance="ghost" variant="neutral" dot>Paused</Badge>
        <Badge appearance="ghost" variant="destructive" dot>Blocked</Badge>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Badge } from "@bpdm/ui";

export function Example() {
  return (
    <>
      {/* pill with a dot */}
      <Badge variant="info" dot pulse>Deploying</Badge>

      {/* bare dot + label (ghost), e.g. in a table cell */}
      <Badge appearance="ghost" variant="success" dot>Healthy</Badge>
    </>
  );
}`,
      },
    },
  },
};

// removable chips — collapse + fade out on remove
export const Removable: Story = {
  render: () => {
    const [tags, setTags] = useState([
      "Frontend",
      "Backend",
      "Design",
      "Infra",
      "Docs",
    ]);
    return (
      <div className="flex min-h-8 flex-wrap items-center gap-2">
        {tags.map((t) => (
          <Badge
            key={t}
            variant="neutral"
            onRemove={() => setTags((cur) => cur.filter((x) => x !== t))}
          >
            {t}
          </Badge>
        ))}
        {tags.length === 0 && (
          <Button size="sm" variant="secondary" appearance="ghost" onClick={() => setTags(["Frontend", "Backend", "Design", "Infra", "Docs"])}>
            Reset
          </Button>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { Badge, Button } from "@bpdm/ui";

const INITIAL = ["Frontend", "Backend", "Design", "Infra", "Docs"];

export function Example() {
  const [tags, setTags] = useState(INITIAL);
  return (
    <div className="flex min-h-8 flex-wrap items-center gap-2">
      {tags.map((t) => (
        <Badge
          key={t}
          variant="neutral"
          onRemove={() => setTags((cur) => cur.filter((x) => x !== t))}
        >
          {t}
        </Badge>
      ))}
      {tags.length === 0 && (
        <Button size="sm" variant="secondary" appearance="ghost" onClick={() => setTags(INITIAL)}>
          Reset
        </Button>
      )}
    </div>
  );
}`,
      },
    },
  },
};

// count / dot overlaid on an icon or button
export const Notifications: Story = {
  render: () => {
    const [count, setCount] = useState(3);
    return (
      <div className="flex items-center gap-6">
        <Button size="icon" variant="secondary" appearance="ghost" aria-label="Notifications">
          <NotificationBadge count={count}>
            <Bell />
          </NotificationBadge>
        </Button>

        <Button size="icon" variant="secondary" appearance="ghost" aria-label="Inbox">
          <NotificationBadge count={128} max={99}>
            <Mail />
          </NotificationBadge>
        </Button>

        <Button size="icon" variant="secondary" appearance="ghost" aria-label="Status">
          <NotificationBadge dot variant="success">
            <Bell />
          </NotificationBadge>
        </Button>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" appearance="outline" onClick={() => setCount((c) => c + 1)}>
            Add
          </Button>
          <Button size="sm" variant="secondary" appearance="ghost" onClick={() => setCount(0)}>
            Clear
          </Button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { Bell, Mail } from "lucide-react";
import { Button, NotificationBadge } from "@bpdm/ui";

export function Example() {
  return (
    <>
      <Button size="icon" variant="secondary" appearance="ghost" aria-label="Notifications">
        <NotificationBadge count={8}><Bell /></NotificationBadge>
      </Button>
      <Button size="icon" variant="secondary" appearance="ghost" aria-label="Inbox">
        <NotificationBadge count={128} max={99}><Mail /></NotificationBadge>
      </Button>
      <Button size="icon" variant="secondary" appearance="ghost" aria-label="Status">
        <NotificationBadge dot variant="success"><Bell /></NotificationBadge>
      </Button>
    </>
  );
}`,
      },
    },
  },
};

// as a link (asChild) — interactive press
export const AsLink: Story = {
  tags: ["!dev"],
  render: () => (
    <Badge asChild variant="primary" appearance="soft">
      <a href="#changelog">What’s new →</a>
    </Badge>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Badge } from "@bpdm/ui";

export function Example() {
  return (
    <Badge asChild variant="primary" appearance="soft">
      <a href="/changelog">What’s new →</a>
    </Badge>
  );
}`,
      },
    },
  },
};
