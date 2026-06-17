import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { Switch } from "./switch";

const usage = `
On/off toggle built on Radix. Controlled (\`checked\` + \`onCheckedChange\`) or
uncontrolled (\`defaultChecked\`). Sizes, disabled, and label association.

\`\`\`tsx
import { Switch } from "@bpdm/ui";

<Switch defaultChecked />
<div className="flex items-center gap-2">
  <Switch id="airplane" />
  <label htmlFor="airplane">Airplane mode</label>
</div>
\`\`\`
`;

const meta: Meta<typeof Switch> = {
  title: "Selection/Switch",
  component: Switch,
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
    size: { control: "select", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["pill", "square", "sharp"] },
    icon: { control: "boolean" },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { size: "md" },
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const Playground: Story = {};

export const States: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Switch />
<Switch defaultChecked />
<Switch disabled />
<Switch disabled defaultChecked />`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-5">
      <Switch />
      <Switch defaultChecked />
      <Switch disabled />
      <Switch disabled defaultChecked />
    </div>
  ),
};

// pill (default) / square / sharp track + thumb
export const Shapes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Switch shape="pill" defaultChecked />
<Switch shape="square" defaultChecked />
<Switch shape="sharp" defaultChecked />`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-6">
      {(["pill", "square", "sharp"] as const).map((s) => (
        <div key={s} className="flex items-center gap-2">
          <Switch shape={s} defaultChecked />
          <span className="text-sm text-muted-foreground">{s}</span>
        </div>
      ))}
    </div>
  ),
};

// ✓ / ✗ glyph inside the thumb
export const WithIcon: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Switch icon defaultChecked />
<Switch icon />`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-5">
      <Switch icon defaultChecked />
      <Switch icon />
      <Switch icon size="lg" defaultChecked />
    </div>
  ),
};

export const Sizes: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Switch size="sm" defaultChecked />
<Switch size="md" defaultChecked />
<Switch size="lg" defaultChecked />`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-5">
      <Switch size="sm" defaultChecked />
      <Switch size="md" defaultChecked />
      <Switch size="lg" defaultChecked />
    </div>
  ),
};

// label association via htmlFor (clicking the label toggles)
export const WithLabel: Story = {
  parameters: {
    docs: {
      source: {
        code: `<div className="flex items-center gap-2">
  <Switch id="airplane" defaultChecked />
  <label htmlFor="airplane">Airplane mode</label>
</div>`,
      },
    },
  },
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="airplane" defaultChecked />
      <label htmlFor="airplane" className="cursor-pointer text-sm text-foreground">
        Airplane mode
      </label>
    </div>
  ),
};

// a settings list of toggles
export const SettingsList: Story = {
  parameters: {
    docs: {
      source: {
        code: `{settings.map((s) => (
  <div key={s.id} className="flex items-center justify-between gap-8">
    <label htmlFor={s.id}>{s.label}</label>
    <Switch id={s.id} defaultChecked={s.on} />
  </div>
))}`,
      },
    },
  },
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      {[
        { id: "s-2fa", label: "Two-factor authentication", on: true },
        { id: "s-email", label: "Email notifications", on: false },
        { id: "s-beta", label: "Beta features", on: true },
      ].map((s) => (
        <div key={s.id} className="flex items-center justify-between gap-8">
          <label htmlFor={s.id} className="cursor-pointer text-sm text-foreground">
            {s.label}
          </label>
          <Switch id={s.id} defaultChecked={s.on} />
        </div>
      ))}
    </div>
  ),
};
