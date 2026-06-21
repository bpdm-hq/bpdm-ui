import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { FileText, Rocket, RotateCcw, Users } from "lucide-react";
import { Accordion } from "./accordion";

const usage = `
Accordion built on an accessible primitive (keyboard + ARIA) with a smoothly
animated height, a rotating chevron, and two looks — \`default\` (a bordered list)
and \`separated\` (each item a card). Single or multiple panels open at once.
Data-driven via \`items\`, or compose \`AccordionItem\`/\`AccordionTrigger\`/\`AccordionContent\`.

\`\`\`tsx
import { Accordion } from "@bpdm/ui";

<Accordion
  items={[
    {
      value: "deploys",
      title: "How are deploys triggered?",
      content: "Every merge to the main branch kicks off a build and a production deploy.",
    },
    {
      value: "rollback",
      title: "Can I roll back a release?",
      content: "Open any past deploy and choose “Promote to production” to roll back.",
    },
  ]}
/>
\`\`\`
`;

const FAQ = [
  {
    value: "deploys",
    title: "How are deploys triggered?",
    content:
      "Every merge to the main branch kicks off a build and a production deploy. You can also trigger a manual deploy from the dashboard.",
  },
  {
    value: "rollback",
    title: "Can I roll back a release?",
    content:
      "Yes — open any past deploy and choose “Promote to production” to instantly roll back to that version.",
  },
  {
    value: "logs",
    title: "Where are build logs stored?",
    content: "Build and runtime logs are retained for 30 days and are searchable per deploy and per service.",
  },
  {
    value: "members",
    title: "How do I invite a teammate?",
    content:
      "Open Settings → Members, enter their email and pick a role. They’ll receive an invite link by email.",
  },
];

const meta: Meta<typeof Accordion> = {
  title: "Navigation/Accordion",
  component: Accordion,
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
    variant: { control: "inline-radio", options: ["default", "separated", "borderless"] },
    items: { table: { disable: true } },
  },
  args: { variant: "default", items: FAQ, defaultValue: "deploys" },
  render: (args) => (
    <div className="w-full max-w-xl">
      <Accordion {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Accordion>;

export const Playground: Story = {};

// minimal — no container border, just dividers; the open header stands out
export const Borderless: Story = {
  args: { variant: "borderless", defaultValue: "rollback" },
  parameters: {
    docs: {
      source: {
        code: `import { Accordion } from "@bpdm/ui";

export function Example() {
  return (
    <Accordion
      variant="borderless"
      items={[
        { value: "deploys", title: "How are deploys triggered?", content: "Every merge to main deploys to production." },
        { value: "rollback", title: "Can I roll back a release?", content: "Promote any past deploy to roll back." },
        { value: "logs", title: "Where are build logs stored?", content: "Retained for 30 days, fully searchable." },
      ]}
    />
  );
}`,
      },
    },
  },
};

// each item is its own card
export const Separated: Story = {
  args: { variant: "separated", defaultValue: "deploys" },
  parameters: {
    docs: {
      source: {
        code: `import { Accordion } from "@bpdm/ui";

export function Example() {
  return (
    <Accordion
      variant="separated"
      items={[
        { value: "deploys", title: "How are deploys triggered?", content: "Every merge to main deploys to production." },
        { value: "rollback", title: "Can I roll back a release?", content: "Promote any past deploy to roll back." },
        { value: "logs", title: "Where are build logs stored?", content: "Retained for 30 days, fully searchable." },
      ]}
    />
  );
}`,
      },
    },
  },
};

// a leading icon per item
export const WithIcons: Story = {
  args: {
    variant: "separated",
    items: [
      { ...FAQ[0], icon: <Rocket /> },
      { ...FAQ[1], icon: <RotateCcw /> },
      { ...FAQ[2], icon: <FileText /> },
      { ...FAQ[3], icon: <Users /> },
    ],
  },
  parameters: {
    docs: {
      source: {
        code: `import { Accordion } from "@bpdm/ui";
import { Rocket, RotateCcw, FileText, Users } from "lucide-react";

export function Example() {
  return (
    <Accordion
      variant="separated"
      items={[
        { value: "deploys", title: "How are deploys triggered?", icon: <Rocket />, content: "Every merge to main deploys to production." },
        { value: "rollback", title: "Can I roll back a release?", icon: <RotateCcw />, content: "Promote any past deploy to roll back." },
        { value: "logs", title: "Where are build logs stored?", icon: <FileText />, content: "Retained for 30 days, fully searchable." },
        { value: "members", title: "How do I invite a teammate?", icon: <Users />, content: "Settings → Members → enter an email." },
      ]}
    />
  );
}`,
      },
    },
  },
};

// more than one panel open at a time
export const Multiple: Story = {
  tags: ["!dev"],
  args: { type: "multiple", defaultValue: ["deploys", "logs"], items: FAQ },
  parameters: {
    docs: {
      source: {
        code: `import { Accordion } from "@bpdm/ui";

export function Example() {
  return (
    <Accordion
      type="multiple"
      defaultValue={["deploys", "logs"]}
      items={[
        { value: "deploys", title: "How are deploys triggered?", content: "Every merge to main deploys to production." },
        { value: "logs", title: "Where are build logs stored?", content: "Retained for 30 days, fully searchable." },
        { value: "members", title: "How do I invite a teammate?", content: "Settings → Members → enter an email." },
      ]}
    />
  );
}`,
      },
    },
  },
};

export const DisabledItem: Story = {
  tags: ["!dev"],
  args: {
    items: [
      FAQ[0],
      { ...FAQ[1], disabled: true },
      FAQ[2],
    ],
  },
  parameters: {
    docs: {
      source: {
        code: `import { Accordion } from "@bpdm/ui";

export function Example() {
  return (
    <Accordion
      items={[
        { value: "deploys", title: "How are deploys triggered?", content: "Every merge to main deploys to production." },
        { value: "rollback", title: "Can I roll back a release?", disabled: true, content: "Promote any past deploy to roll back." },
        { value: "logs", title: "Where are build logs stored?", content: "Retained for 30 days, fully searchable." },
      ]}
    />
  );
}`,
      },
    },
  },
};
