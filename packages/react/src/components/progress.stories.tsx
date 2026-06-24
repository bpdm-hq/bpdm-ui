import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { useEffect, useState } from "react";
import { ProgressBar, type ProgressVariant } from "./progress";
import { Button } from "./button";

const usage = `
Process indicator. Determinate — drive \`value\` (the fill animates smoothly to its
new width) — or \`indeterminate\` for an animated sweep when there's no known total.
Five colors, three sizes, the value above the bar or \`valuePosition="inside"\`, and a
custom \`format\`.

\`\`\`tsx
import { ProgressBar } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      <ProgressBar value={60} />
      <ProgressBar value={72} showValue label="Uploading…" variant="success" />
      <ProgressBar value={48} valuePosition="inside" />
      <ProgressBar indeterminate />
    </div>
  );
}
\`\`\`
`;

const meta: Meta<typeof ProgressBar> = {
  title: "Feedback/ProgressBar",
  component: ProgressBar,
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
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    max: { control: "number" },
    indeterminate: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    variant: {
      control: "inline-radio",
      options: ["primary", "success", "warning", "destructive", "info"],
    },
    showValue: { control: "boolean" },
    valuePosition: { control: "inline-radio", options: ["outside", "inside"] },
    format: { table: { disable: true } },
  },
  args: { value: 60, max: 100, size: "md", variant: "primary", showValue: false },
  render: (args) => (
    <div className="w-full max-w-md">
      <ProgressBar {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Playground: Story = {};

// the percentage sits inside the bar (readable on both the fill and the track)
export const ValueInside: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <ProgressBar value={72} valuePosition="inside" />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { ProgressBar } from "@bpdm/ui";

export function Example() {
  return <ProgressBar value={72} valuePosition="inside" />;
}`,
      },
    },
  },
};

// no known total — an animated sweep
export const Indeterminate: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <ProgressBar indeterminate />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { ProgressBar } from "@bpdm/ui";

export function Example() {
  return <ProgressBar indeterminate />;
}`,
      },
    },
  },
};

// the five semantic colors
export const Variants: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-4">
      {(["primary", "success", "warning", "destructive", "info"] as ProgressVariant[]).map(
        (variant, i) => (
          <ProgressBar key={variant} variant={variant} value={(i + 1) * 18} showValue label={variant} />
        ),
      )}
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { ProgressBar, type ProgressVariant } from "@bpdm/ui";

const VARIANTS: ProgressVariant[] = ["primary", "success", "warning", "destructive", "info"];

export function Example() {
  return (
    <div className="flex max-w-md flex-col gap-4">
      {VARIANTS.map((variant, i) => (
        <ProgressBar key={variant} variant={variant} value={(i + 1) * 18} showValue label={variant} />
      ))}
    </div>
  );
}`,
      },
    },
  },
};

// value updates animate the fill smoothly
export const Dynamic: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    useEffect(() => {
      const id = setInterval(() => {
        setValue((v) => (v >= 100 ? 0 : v + 10));
      }, 900);
      return () => clearInterval(id);
    }, []);
    return (
      <div className="w-full max-w-md">
        <ProgressBar
          value={value}
          showValue
          label="Syncing"
          variant={value >= 100 ? "success" : "primary"}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useEffect, useState } from "react";
import { ProgressBar } from "@bpdm/ui";

export function Example() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 10)), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <ProgressBar
      value={value}
      showValue
      label="Syncing"
      variant={value >= 100 ? "success" : "primary"}
    />
  );
}`,
      },
    },
  },
};

// custom label in the row (e.g. "50/100 GB")
export const CustomLabel: Story = {
  tags: ["!dev"],
  render: () => (
    <div className="w-full max-w-md">
      <ProgressBar value={50} max={100} label="Storage" format={(v, max) => `${v}/${max} GB`} />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { ProgressBar } from "@bpdm/ui";

export function Example() {
  return (
    <ProgressBar
      value={50}
      max={100}
      label="Storage"
      format={(v, max) => \`\${v}/\${max} GB\`}
    />
  );
}`,
      },
    },
  },
};

export const Sizes: Story = {
  tags: ["!dev"],
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-5">
      {(["sm", "md", "lg"] as const).map((size) => (
        <ProgressBar key={size} size={size} value={62} />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { ProgressBar } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex max-w-md flex-col gap-5">
      {(["sm", "md", "lg"] as const).map((size) => (
        <ProgressBar key={size} size={size} value={62} />
      ))}
    </div>
  );
}`,
      },
    },
  },
};

// scoped to a card while a file uploads
export const InCard: Story = {
  tags: ["!dev"],
  render: () => {
    const [value, setValue] = useState(0);
    const [uploading, setUploading] = useState(false);
    const start = () => {
      setUploading(true);
      setValue(0);
      const id = setInterval(() => {
        setValue((v) => {
          if (v >= 100) {
            clearInterval(id);
            setUploading(false);
            return 100;
          }
          return v + 8;
        });
      }, 220);
    };
    return (
      <div className="w-72 space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <div>
          <p className="text-sm font-medium">report-2025.pdf</p>
          <p className="text-xs text-muted-foreground">4.2 MB</p>
        </div>
        <ProgressBar value={value} showValue variant={value >= 100 ? "success" : "primary"} />
        <Button size="sm" variant="secondary" appearance="outline" onClick={start} disabled={uploading}>
          {value >= 100 ? "Upload again" : "Upload"}
        </Button>
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import { ProgressBar, Button } from "@bpdm/ui";

export function Example() {
  const [value, setValue] = useState(0);
  const [uploading, setUploading] = useState(false);

  const start = () => {
    setUploading(true);
    setValue(0);
    const id = setInterval(() => {
      setValue((v) => {
        if (v >= 100) {
          clearInterval(id);
          setUploading(false);
          return 100;
        }
        return v + 8;
      });
    }, 220);
  };

  return (
    <div className="w-72 space-y-4 rounded-xl border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-medium">report-2025.pdf</p>
        <p className="text-xs text-muted-foreground">4.2 MB</p>
      </div>
      <ProgressBar value={value} showValue variant={value >= 100 ? "success" : "primary"} />
      <Button size="sm" variant="secondary" appearance="outline" onClick={start} disabled={uploading}>
        {value >= 100 ? "Upload again" : "Upload"}
      </Button>
    </div>
  );
}`,
      },
    },
  },
};
