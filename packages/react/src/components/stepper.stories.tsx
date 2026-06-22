import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { useState } from "react";
import { CircleUser, ListChecks, SlidersHorizontal } from "lucide-react";
import {
  Step,
  StepItem,
  StepList,
  StepPanel,
  StepPanels,
  Stepper,
  useStepper,
} from "./stepper";
import { Button } from "./button";
import { Input } from "./input";

const usage = `
A step-by-step flow. State lives in \`Stepper\` (controlled via \`value\` or
uncontrolled via \`defaultValue\`); steps are ordered by declaration. Horizontal
(\`StepList\` + \`StepPanels\`) or vertical (\`StepItem\`), with optional \`linear\`
gating. Drive navigation from anywhere with the \`useStepper()\` hook.

\`\`\`tsx
import { Stepper, StepList, Step, StepPanels, StepPanel, useStepper } from "@bpdm/ui";

function Nav() {
  const { isFirst, isLast, next, back, complete } = useStepper();
  return (
    <div className="flex justify-between">
      <Button variant="ghost" onClick={back} disabled={isFirst}>Back</Button>
      {isLast
        ? <Button onClick={complete}>Finish</Button>  // marks every step done
        : <Button onClick={next}>Next</Button>}
    </div>
  );
}

<Stepper defaultValue="1">
  <StepList>
    <Step value="1">Account</Step>
    <Step value="2">Workspace</Step>
    <Step value="3">Review</Step>
  </StepList>
  <StepPanels>
    <StepPanel value="1">Tell us who you are — name and email.</StepPanel>
    <StepPanel value="2">Name your workspace and pick a URL.</StepPanel>
    <StepPanel value="3">Everything looks good — review and finish.</StepPanel>
  </StepPanels>
  <Nav />
</Stepper>
\`\`\`
`;

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function Nav({ onFinish }: { onFinish?: () => void }) {
  const { isFirst, isLast, next, back, complete } = useStepper();
  return (
    <div className="mt-4 flex items-center justify-between">
      <Button variant="ghost" size="sm" onClick={back} disabled={isFirst}>
        Back
      </Button>
      {isLast ? (
        <Button
          size="sm"
          onClick={() => {
            complete(); // marks every step done — the last step now shows a check
            onFinish?.();
          }}
        >
          Finish
        </Button>
      ) : (
        <Button size="sm" onClick={next}>
          Next
        </Button>
      )}
    </div>
  );
}

// nav whose Next is gated by the developer's own validation (`canNext`)
function GateNav({ canNext, onFinish }: { canNext: boolean; onFinish?: () => void }) {
  const { isFirst, isLast, next, back, complete } = useStepper();
  return (
    <div className="mt-4 flex items-center justify-between">
      <Button variant="ghost" size="sm" onClick={back} disabled={isFirst}>
        Back
      </Button>
      {isLast ? (
        <Button
          size="sm"
          onClick={() => {
            complete();
            onFinish?.();
          }}
        >
          Finish
        </Button>
      ) : (
        <Button size="sm" onClick={next} disabled={!canNext}>
          Next
        </Button>
      )}
    </div>
  );
}

const meta: Meta<typeof Stepper> = {
  title: "Navigation/Stepper",
  component: Stepper,
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
    linear: { control: "boolean" },
    orientation: { table: { disable: true } },
  },
  args: { linear: false },
  render: (args) => (
    <div className="w-full max-w-2xl">
      <Stepper {...args} defaultValue="1">
        <StepList>
          <Step value="1">Account</Step>
          <Step value="2">Workspace</Step>
          <Step value="3">Review</Step>
        </StepList>
        <StepPanels>
          <StepPanel value="1">
            <Box>Tell us who you are — name and email.</Box>
          </StepPanel>
          <StepPanel value="2">
            <Box>Name your workspace and pick a URL.</Box>
          </StepPanel>
          <StepPanel value="3">
            <Box>Everything looks good — review and finish.</Box>
          </StepPanel>
        </StepPanels>
        <Nav onFinish={() => window.alert("Done ✓")} />
      </Stepper>
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Stepper>;

export const Horizontal: Story = {
  parameters: {
    docs: {
      source: {
        code: `import {
  Stepper,
  StepList,
  Step,
  StepPanels,
  StepPanel,
  useStepper,
  Button,
} from "@bpdm/ui";

function Nav() {
  const { isFirst, isLast, next, back, complete } = useStepper();
  return (
    <div className="mt-4 flex justify-between">
      <Button variant="ghost" size="sm" onClick={back} disabled={isFirst}>Back</Button>
      {isLast
        ? <Button size="sm" onClick={complete}>Finish</Button>  // every step shows a check
        : <Button size="sm" onClick={next}>Next</Button>}
    </div>
  );
}

export function Example() {
  return (
    <Stepper defaultValue="1">
      <StepList>
        <Step value="1">Account</Step>
        <Step value="2">Workspace</Step>
        <Step value="3">Review</Step>
      </StepList>
      <StepPanels>
        <StepPanel value="1">Tell us who you are — name and email.</StepPanel>
        <StepPanel value="2">Name your workspace and pick a URL.</StepPanel>
        <StepPanel value="3">Everything looks good — review and finish.</StepPanel>
      </StepPanels>
      <Nav />
    </Stepper>
  );
}`,
      },
    },
  },
};

// content sits inline under each step header
export const Vertical: Story = {
  render: () => (
    <div className="w-full max-w-xl">
      <Stepper orientation="vertical" defaultValue="1">
        <StepItem value="1">
          <Step>Account</Step>
          <StepPanel>
            <Box>Tell us who you are — name and email.</Box>
            <Nav />
          </StepPanel>
        </StepItem>
        <StepItem value="2">
          <Step>Workspace</Step>
          <StepPanel>
            <Box>Name your workspace and pick a URL.</Box>
            <Nav />
          </StepPanel>
        </StepItem>
        <StepItem value="3">
          <Step>Review</Step>
          <StepPanel>
            <Box>Everything looks good — review and finish.</Box>
            <Nav onFinish={() => window.alert("Done ✓")} />
          </StepPanel>
        </StepItem>
      </Stepper>
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import {
  Stepper,
  StepItem,
  Step,
  StepPanel,
  useStepper,
  Button,
} from "@bpdm/ui";

function Nav() {
  const { isFirst, isLast, next, back, complete } = useStepper();
  return (
    <div className="mt-4 flex justify-between">
      <Button variant="ghost" size="sm" onClick={back} disabled={isFirst}>Back</Button>
      {isLast
        ? <Button size="sm" onClick={complete}>Finish</Button>
        : <Button size="sm" onClick={next}>Next</Button>}
    </div>
  );
}

export function Example() {
  return (
    <Stepper orientation="vertical" defaultValue="1">
      <StepItem value="1">
        <Step>Account</Step>
        <StepPanel>
          Tell us who you are — name and email.
          <Nav />
        </StepPanel>
      </StepItem>
      <StepItem value="2">
        <Step>Workspace</Step>
        <StepPanel>
          Name your workspace and pick a URL.
          <Nav />
        </StepPanel>
      </StepItem>
      <StepItem value="3">
        <Step>Review</Step>
        <StepPanel>
          Everything looks good — review and finish.
          <Nav />
        </StepPanel>
      </StepItem>
    </Stepper>
  );
}`,
      },
    },
  },
};

// linear — future steps aren't clickable until reached; advance with Next
export const Linear: Story = {
  args: { linear: true },
  parameters: {
    docs: {
      source: {
        code: `import {
  Stepper,
  StepList,
  Step,
  StepPanels,
  StepPanel,
  useStepper,
  Button,
} from "@bpdm/ui";

function Nav() {
  const { isFirst, isLast, next, back, complete } = useStepper();
  return (
    <div className="mt-4 flex justify-between">
      <Button variant="ghost" size="sm" onClick={back} disabled={isFirst}>Back</Button>
      {isLast
        ? <Button size="sm" onClick={complete}>Finish</Button>
        : <Button size="sm" onClick={next}>Next</Button>}
    </div>
  );
}

export function Example() {
  return (
    <Stepper defaultValue="1" linear>
      <StepList>
        <Step value="1">Account</Step>
        <Step value="2">Workspace</Step>
        <Step value="3">Review</Step>
      </StepList>
      <StepPanels>
        <StepPanel value="1">Tell us who you are — name and email.</StepPanel>
        <StepPanel value="2">Name your workspace and pick a URL.</StepPanel>
        <StepPanel value="3">Everything looks good — review and finish.</StepPanel>
      </StepPanels>
      <Nav />
    </Stepper>
  );
}`,
      },
    },
  },
};

// gated progression — a step can't be left until its content is valid, and
// (with linear) future steps stay locked until reached
export const Validated: Story = {
  render: () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const accountValid = name.trim().length > 0 && /.+@.+\..+/.test(email);
    return (
      <div className="w-full max-w-xl">
        <Stepper defaultValue="account" linear lockIndicator>
          <StepList>
            <Step value="account">Account</Step>
            <Step value="workspace">Workspace</Step>
            <Step value="review">Review</Step>
          </StepList>
          <StepPanels>
            <StepPanel value="account">
              <div className="space-y-3 py-2">
                <Input
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {accountValid
                    ? "Looks good — you can continue."
                    : "Enter your name and a valid email to continue."}
                </p>
              </div>
              <GateNav canNext={accountValid} />
            </StepPanel>
            <StepPanel value="workspace">
              <Box>Name your workspace and pick a URL.</Box>
              <GateNav canNext />
            </StepPanel>
            <StepPanel value="review">
              <Box>Everything looks good — review and finish.</Box>
              <GateNav canNext onFinish={() => window.alert("Created ✓")} />
            </StepPanel>
          </StepPanels>
        </Stepper>
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import {
  Stepper,
  StepList,
  Step,
  StepPanels,
  StepPanel,
  useStepper,
  Button,
  Input,
} from "@bpdm/ui";

// Next is disabled until the step is valid; \`linear\` keeps future steps locked.
function GateNav({ canNext, onFinish }) {
  const { isFirst, isLast, next, back, complete } = useStepper();
  return (
    <div className="mt-4 flex justify-between">
      <Button variant="ghost" size="sm" onClick={back} disabled={isFirst}>Back</Button>
      {isLast
        ? <Button size="sm" onClick={() => { complete(); onFinish?.(); }}>Finish</Button>
        : <Button size="sm" onClick={next} disabled={!canNext}>Next</Button>}
    </div>
  );
}

export function Example() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const accountValid = name.trim().length > 0 && /.+@.+\\..+/.test(email);
  return (
    <Stepper defaultValue="account" linear lockIndicator>
      <StepList>
        <Step value="account">Account</Step>
        <Step value="workspace">Workspace</Step>
        <Step value="review">Review</Step>
      </StepList>
      <StepPanels>
        <StepPanel value="account">
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <GateNav canNext={accountValid} />
        </StepPanel>
        <StepPanel value="workspace">
          Name your workspace and pick a URL.
          <GateNav canNext />
        </StepPanel>
        <StepPanel value="review">
          Everything looks good — review and finish.
          <GateNav canNext onFinish={() => window.alert("Created ✓")} />
        </StepPanel>
      </StepPanels>
    </Stepper>
  );
}`,
      },
    },
  },
};

// just the progress indicator (no panels) — clickable steps
export const StepsOnly: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <Stepper defaultValue="design">
        <StepList>
          <Step value="design">Design</Step>
          <Step value="development">Development</Step>
          <Step value="qa">QA</Step>
        </StepList>
      </Stepper>
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Stepper, StepList, Step } from "@bpdm/ui";

export function Example() {
  return (
    <Stepper defaultValue="design">
      <StepList>
        <Step value="design">Design</Step>
        <Step value="development">Development</Step>
        <Step value="qa">QA</Step>
      </StepList>
    </Stepper>
  );
}`,
      },
    },
  },
};

// custom marker icons + form content
export const Template: Story = {
  render: () => (
    <div className="w-full max-w-xl">
      <Stepper defaultValue="account">
        <StepList>
          <Step value="account" icon={<CircleUser />}>
            Account
          </Step>
          <Step value="preferences" icon={<SlidersHorizontal />}>
            Preferences
          </Step>
          <Step value="review" icon={<ListChecks />}>
            Review
          </Step>
        </StepList>
        <StepPanels>
          <StepPanel value="account">
            <div className="space-y-3 py-2">
              <Input placeholder="Full name" />
              <Input placeholder="Email" type="email" />
            </div>
          </StepPanel>
          <StepPanel value="preferences">
            <div className="space-y-3 py-2">
              <Input placeholder="Workspace name" />
              <Input placeholder="URL slug" />
            </div>
          </StepPanel>
          <StepPanel value="review">
            <Box>Confirm your details and finish creating the workspace.</Box>
          </StepPanel>
        </StepPanels>
        <Nav onFinish={() => window.alert("Created ✓")} />
      </Stepper>
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { CircleUser, SlidersHorizontal, ListChecks } from "lucide-react";
import {
  Stepper,
  StepList,
  Step,
  StepPanels,
  StepPanel,
  useStepper,
  Button,
  Input,
} from "@bpdm/ui";

function Nav() {
  const { isFirst, isLast, next, back, complete } = useStepper();
  return (
    <div className="mt-4 flex justify-between">
      <Button variant="ghost" size="sm" onClick={back} disabled={isFirst}>Back</Button>
      {isLast
        ? <Button size="sm" onClick={complete}>Finish</Button>
        : <Button size="sm" onClick={next}>Next</Button>}
    </div>
  );
}

export function Example() {
  return (
    <Stepper defaultValue="account">
      <StepList>
        <Step value="account" icon={<CircleUser />}>Account</Step>
        <Step value="preferences" icon={<SlidersHorizontal />}>Preferences</Step>
        <Step value="review" icon={<ListChecks />}>Review</Step>
      </StepList>
      <StepPanels>
        <StepPanel value="account">
          <Input placeholder="Full name" />
          <Input placeholder="Email" type="email" />
        </StepPanel>
        <StepPanel value="preferences">
          <Input placeholder="Workspace name" />
          <Input placeholder="URL slug" />
        </StepPanel>
        <StepPanel value="review">Confirm your details and finish.</StepPanel>
      </StepPanels>
      <Nav />
    </Stepper>
  );
}`,
      },
    },
  },
};

// as few as two steps
export const TwoSteps: Story = {
  tags: ["!dev"],
  render: () => (
    <div className="w-full max-w-xl">
      <Stepper defaultValue="details">
        <StepList>
          <Step value="details">Details</Step>
          <Step value="confirm">Confirm</Step>
        </StepList>
        <StepPanels>
          <StepPanel value="details">
            <Box>Enter the details for your new project.</Box>
          </StepPanel>
          <StepPanel value="confirm">
            <Box>Review and confirm to create it.</Box>
          </StepPanel>
        </StepPanels>
        <Nav onFinish={() => window.alert("Created ✓")} />
      </Stepper>
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import {
  Stepper,
  StepList,
  Step,
  StepPanels,
  StepPanel,
  useStepper,
  Button,
} from "@bpdm/ui";

function Nav() {
  const { isFirst, isLast, next, back, complete } = useStepper();
  return (
    <div className="mt-4 flex justify-between">
      <Button variant="ghost" size="sm" onClick={back} disabled={isFirst}>Back</Button>
      {isLast
        ? <Button size="sm" onClick={complete}>Finish</Button>
        : <Button size="sm" onClick={next}>Next</Button>}
    </div>
  );
}

export function Example() {
  return (
    <Stepper defaultValue="details">
      <StepList>
        <Step value="details">Details</Step>
        <Step value="confirm">Confirm</Step>
      </StepList>
      <StepPanels>
        <StepPanel value="details">Enter the details for your new project.</StepPanel>
        <StepPanel value="confirm">Review and confirm to create it.</StepPanel>
      </StepPanels>
      <Nav />
    </Stepper>
  );
}`,
      },
    },
  },
};

// step count is fully configurable — here are five (use any number)
export const FiveSteps: Story = {
  tags: ["!dev"],
  render: () => {
    const STEPS = [
      { value: "account", label: "Account", body: "Tell us who you are — name and email." },
      { value: "team", label: "Team", body: "Invite teammates and assign roles." },
      { value: "project", label: "Project", body: "Create your first project." },
      { value: "integrations", label: "Integrations", body: "Connect the tools you already use." },
      { value: "review", label: "Review", body: "Everything looks good — review and finish." },
    ];
    return (
      <div className="w-full max-w-3xl">
        <Stepper defaultValue="account">
          <StepList>
            {STEPS.map((s) => (
              <Step key={s.value} value={s.value}>
                {s.label}
              </Step>
            ))}
          </StepList>
          <StepPanels>
            {STEPS.map((s) => (
              <StepPanel key={s.value} value={s.value}>
                <Box>{s.body}</Box>
              </StepPanel>
            ))}
          </StepPanels>
          <Nav onFinish={() => window.alert("Done ✓")} />
        </Stepper>
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import {
  Stepper,
  StepList,
  Step,
  StepPanels,
  StepPanel,
  useStepper,
  Button,
} from "@bpdm/ui";

const STEPS = [
  { value: "account", label: "Account", body: "Tell us who you are." },
  { value: "team", label: "Team", body: "Invite teammates and assign roles." },
  { value: "project", label: "Project", body: "Create your first project." },
  { value: "integrations", label: "Integrations", body: "Connect your tools." },
  { value: "review", label: "Review", body: "Review and finish." },
];

function Nav() {
  const { isFirst, isLast, next, back, complete } = useStepper();
  return (
    <div className="mt-4 flex justify-between">
      <Button variant="ghost" size="sm" onClick={back} disabled={isFirst}>Back</Button>
      {isLast
        ? <Button size="sm" onClick={complete}>Finish</Button>
        : <Button size="sm" onClick={next}>Next</Button>}
    </div>
  );
}

export function Example() {
  return (
    <Stepper defaultValue="account">
      <StepList>
        {STEPS.map((s) => (
          <Step key={s.value} value={s.value}>{s.label}</Step>
        ))}
      </StepList>
      <StepPanels>
        {STEPS.map((s) => (
          <StepPanel key={s.value} value={s.value}>{s.body}</StepPanel>
        ))}
      </StepPanels>
      <Nav />
    </Stepper>
  );
}`,
      },
    },
  },
};

// controlled from outside — single source of truth in your own state
export const Controlled: Story = {
  tags: ["!dev"],
  render: () => {
    const [value, setValue] = useState("1");
    return (
      <div className="w-full max-w-2xl space-y-3">
        <p className="text-sm text-muted-foreground">
          Active step: <span className="font-medium text-foreground">{value}</span>
        </p>
        <Stepper value={value} onValueChange={setValue}>
          <StepList>
            <Step value="1">Account</Step>
            <Step value="2">Workspace</Step>
            <Step value="3">Review</Step>
          </StepList>
          <StepPanels>
            <StepPanel value="1">
              <Box>Step one content.</Box>
            </StepPanel>
            <StepPanel value="2">
              <Box>Step two content.</Box>
            </StepPanel>
            <StepPanel value="3">
              <Box>Step three content.</Box>
            </StepPanel>
          </StepPanels>
          <Nav />
        </Stepper>
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { useState } from "react";
import {
  Stepper,
  StepList,
  Step,
  StepPanels,
  StepPanel,
  useStepper,
  Button,
} from "@bpdm/ui";

function Nav() {
  const { isFirst, isLast, next, back, complete } = useStepper();
  return (
    <div className="mt-4 flex justify-between">
      <Button variant="ghost" size="sm" onClick={back} disabled={isFirst}>Back</Button>
      {isLast
        ? <Button size="sm" onClick={complete}>Finish</Button>
        : <Button size="sm" onClick={next}>Next</Button>}
    </div>
  );
}

export function Example() {
  const [value, setValue] = useState("1");
  return (
    <Stepper value={value} onValueChange={setValue}>
      <StepList>
        <Step value="1">Account</Step>
        <Step value="2">Workspace</Step>
        <Step value="3">Review</Step>
      </StepList>
      <StepPanels>
        <StepPanel value="1">Step one content.</StepPanel>
        <StepPanel value="2">Step two content.</StepPanel>
        <StepPanel value="3">Step three content.</StepPanel>
      </StepPanels>
      <Nav />
    </Stepper>
  );
}`,
      },
    },
  },
};
