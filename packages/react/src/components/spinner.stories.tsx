import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { useState } from "react";
import { LoadingOverlay, Spinner } from "./spinner";
import { Button } from "./button";

const usage = `
Loading indicators in three looks — \`ring\`, \`dots\`, \`bars\`. \`Spinner\` inherits
the current text color (recolor with \`text-*\`) and sizes xs–xl. \`LoadingOverlay\`
drops a soft, blurred scrim + spinner over the nearest \`relative\` ancestor — scope
it to a single card while it fetches, or use \`fullPage\` for the whole screen.

\`\`\`tsx
import { Spinner, LoadingOverlay } from "@bpdm/ui";

<Spinner />
<Spinner variant="dots" size="lg" className="text-success" />

// scoped to a card while data loads
<div className="relative">
  <Stat />
  <LoadingOverlay show={loading} label="Fetching…" />
</div>

// whole screen
<LoadingOverlay show={loading} fullPage label="Loading…" />
\`\`\`
`;

const meta: Meta<typeof Spinner> = {
  title: "Feedback/Spinner",
  component: Spinner,
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
      options: ["ring", "gradient", "square", "dots", "bars", "flip"],
    },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    label: { control: "text" },
  },
  args: { variant: "ring", size: "lg" },
};
export default meta;

type Story = StoryObj<typeof Spinner>;

export const Playground: Story = {};

// three looks
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-16 text-primary">
      {(["ring", "gradient", "square", "dots", "bars", "flip"] as const).map((v) => (
        <div key={v} className="flex w-16 flex-col items-center gap-3">
          {/* uniform-height cell so every spinner centers on the same line */}
          <span className="flex h-10 items-center justify-center">
            <Spinner variant={v} size="lg" />
          </span>
          <span className="text-xs text-muted-foreground">{v}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Spinner } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex flex-wrap items-start gap-16 text-primary">
      <Spinner variant="ring" size="lg" />
      <Spinner variant="gradient" size="lg" />
      <Spinner variant="square" size="lg" />
      <Spinner variant="dots" size="lg" />
      <Spinner variant="bars" size="lg" />
      <Spinner variant="flip" size="lg" />
    </div>
  );
}`,
      },
    },
  },
};

// scoped to a card/section while it fetches (give the box \`relative\`)
export const OverlayInCard: Story = {
  render: () => {
    const [loading, setLoading] = useState(false);
    const refetch = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 1600);
    };
    return (
      <div className="w-72 space-y-3">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Active users</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">12,480</p>
          <p className="mt-1 text-xs text-success">+8.2% this week</p>
          <LoadingOverlay show={loading} label="Fetching…" size="md" />
        </div>
        <Button size="sm" variant="secondary" appearance="outline" onClick={refetch}>
          Refetch
        </Button>
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { LoadingOverlay, Button } from "@bpdm/ui";

export function Example() {
  const [loading, setLoading] = useState(false);
  const refetch = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1600);
  };
  return (
    <div className="w-72 space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">Active users</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">12,480</p>
        <p className="mt-1 text-xs text-success">+8.2% this week</p>
        <LoadingOverlay show={loading} label="Fetching…" size="md" />
      </div>
      <Button size="sm" variant="secondary" appearance="outline" onClick={refetch}>
        Refetch
      </Button>
    </div>
  );
}`,
      },
    },
  },
};

// only the value is loading — the rest of the card stays visible (inline spinner
// in place of the number, with a reserved height so the layout doesn't jump)
export const InlineValue: Story = {
  tags: ["!dev"],
  render: () => {
    const [loading, setLoading] = useState(false);
    const refetch = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 1600);
    };
    return (
      <div className="w-72 space-y-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Active users</p>
          <div className="mt-1 flex h-8 items-center">
            {loading ? (
              <Spinner size="sm" variant="dots" className="text-muted-foreground" />
            ) : (
              <span className="text-2xl font-semibold tabular-nums">12,480</span>
            )}
          </div>
          <p className="mt-1 text-xs text-success">+8.2% this week</p>
        </div>
        <Button size="sm" variant="secondary" appearance="outline" onClick={refetch}>
          Refetch amount
        </Button>
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { Spinner, Button } from "@bpdm/ui";

export function Example() {
  const [loading, setLoading] = useState(false);
  const refetch = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1600);
  };
  return (
    <div className="w-72 space-y-3">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">Active users</p>
        {/* reserve the height so swapping spinner ↔ value doesn't shift layout */}
        <div className="mt-1 flex h-8 items-center">
          {loading ? (
            <Spinner size="sm" variant="dots" className="text-muted-foreground" />
          ) : (
            <span className="text-2xl font-semibold tabular-nums">12,480</span>
          )}
        </div>
        <p className="mt-1 text-xs text-success">+8.2% this week</p>
      </div>
      <Button size="sm" variant="secondary" appearance="outline" onClick={refetch}>
        Refetch amount
      </Button>
    </div>
  );
}`,
      },
    },
  },
};

// whole-screen loader
export const FullPage: Story = {
  render: () => {
    const [loading, setLoading] = useState(false);
    return (
      <>
        <Button
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1600);
          }}
        >
          Load page
        </Button>
        <LoadingOverlay show={loading} fullPage label="Loading your workspace…" />
      </>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { LoadingOverlay, Button } from "@bpdm/ui";

export function Example() {
  const [loading, setLoading] = useState(false);
  return (
    <>
      <Button
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1600);
        }}
      >
        Load page
      </Button>
      <LoadingOverlay show={loading} fullPage label="Loading your workspace…" />
    </>
  );
}`,
      },
    },
  },
};

export const Sizes: Story = {
  tags: ["!dev"],
  render: () => (
    <div className="flex items-end gap-6 text-primary">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Spinner size={size} />
          <span className="text-xs text-muted-foreground">{size}</span>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Spinner } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex items-end gap-6 text-primary">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  );
}`,
      },
    },
  },
};

// inherits text color — recolor with text-*
export const Colors: Story = {
  tags: ["!dev"],
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner className="text-primary" />
      <Spinner variant="dots" className="text-success" />
      <Spinner variant="bars" className="text-destructive" />
      <Spinner className="text-muted-foreground" />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Spinner } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex items-center gap-6">
      <Spinner className="text-primary" />
      <Spinner variant="dots" className="text-success" />
      <Spinner variant="bars" className="text-destructive" />
      <Spinner className="text-muted-foreground" />
    </div>
  );
}`,
      },
    },
  },
};

// inside a loading button — inherits the button's text color
export const InButton: Story = {
  tags: ["!dev"],
  render: () => (
    <div className="flex items-center gap-3">
      <Button disabled>
        <Spinner size="sm" className="text-current" /> Saving…
      </Button>
      <Button variant="secondary" appearance="outline" disabled>
        <Spinner size="sm" variant="dots" className="text-current" /> Loading
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Spinner, Button } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex items-center gap-3">
      <Button disabled>
        <Spinner size="sm" className="text-current" /> Saving…
      </Button>
      <Button variant="secondary" appearance="outline" disabled>
        <Spinner size="sm" variant="dots" className="text-current" /> Loading
      </Button>
    </div>
  );
}`,
      },
    },
  },
};
