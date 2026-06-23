import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { useEffect, useState } from "react";
import { Toaster, toast, type ToastPosition } from "./toast";
import { Button } from "./button";

// On the Docs page every story is mounted at once. Since `toast()` writes to a
// global store, each story's own <Toaster> would render the same toast — so it
// appeared in every block. DemoToaster renders exactly ONE Toaster (the first to
// mount wins); the Positions story drives that single Toaster's position.
let toasterRefCount = 0;
let setOwnerPosition: ((p: ToastPosition) => void) | null = null;

function DemoToaster({ position = "bottom-right" }: { position?: ToastPosition }) {
  const [isOwner, setIsOwner] = useState(false);
  const [pos, setPos] = useState<ToastPosition>(position);
  useEffect(() => {
    toasterRefCount += 1;
    const owner = toasterRefCount === 1;
    setIsOwner(owner);
    if (owner) setOwnerPosition = setPos;
    return () => {
      toasterRefCount -= 1;
      if (owner) setOwnerPosition = null;
    };
  }, []);
  return isOwner ? <Toaster position={pos} /> : null;
}

const usage = `
Transient notifications. Call \`toast(...)\` from anywhere — no provider or hook
needed — and render \`<Toaster />\` once near the app root. Variants
(\`success\`, \`error\`, \`warning\`, \`info\`), an optional \`action\`, sticky duration,
swipe-to-dismiss, six dock positions, and \`toast.promise(...)\` for async flows.

\`\`\`tsx
import { Toaster, toast } from "@bpdm/ui";

// once, near the root:
<Toaster position="bottom-right" />

// anywhere:
toast.success("Deployment complete", { description: "Build #482 is live." });
toast.promise(deploy(), {
  loading: "Deploying…",
  success: "Deployed",
  error: "Deploy failed",
});
\`\`\`
`;

const POSITIONS: ToastPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

const meta: Meta<typeof Toaster> = {
  title: "Feedback/Toast",
  component: Toaster,
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
    position: { control: "select", options: POSITIONS },
    duration: { control: { type: "number", min: 1000, step: 500 } },
  },
  args: { position: "bottom-right", duration: 4000 },
};
export default meta;

type Story = StoryObj<typeof Toaster>;

export const Playground: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast("Workspace settings updated")}>Default</Button>
      <Button
        variant="ghost"
        onClick={() =>
          toast.success("Deployment complete", {
            description: "Build #482 is live in production.",
          })
        }
      >
        Success
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          toast.error("Build failed", {
            description: "3 checks failed on the latest commit.",
          })
        }
      >
        Error
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          toast.warning("Approaching seat limit", {
            description: "18 of 20 member seats in use.",
          })
        }
      >
        Warning
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          toast.info("New release available", {
            description: "Version 2.4 is ready to install.",
          })
        }
      >
        Info
      </Button>
      <Button variant="ghost" onClick={() => toast.dismiss()}>
        Dismiss all
      </Button>
      <DemoToaster position={args.position} />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Button, Toaster, toast } from "@bpdm/ui";

export function Example() {
  return (
    <>
      <Button
        onClick={() =>
          toast.success("Deployment complete", {
            description: "Build #482 is live in production.",
          })
        }
      >
        Deploy
      </Button>

      {/* render once near the root: */}
      <Toaster position="bottom-right" />
    </>
  );
}`,
      },
    },
  },
};

// each variant: colored accent + tinted icon
export const Variants: Story = {
  tags: ["!dev"],
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="ghost" onClick={() => toast.success("Invite sent")}>
        Success
      </Button>
      <Button variant="ghost" onClick={() => toast.error("Couldn’t save changes")}>
        Error
      </Button>
      <Button variant="ghost" onClick={() => toast.warning("Storage almost full")}>
        Warning
      </Button>
      <Button variant="ghost" onClick={() => toast.info("Sync finished")}>
        Info
      </Button>
      <DemoToaster />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Button, Toaster, toast } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="ghost" onClick={() => toast.success("Invite sent")}>Success</Button>
      <Button variant="ghost" onClick={() => toast.error("Couldn’t save changes")}>Error</Button>
      <Button variant="ghost" onClick={() => toast.warning("Storage almost full")}>Warning</Button>
      <Button variant="ghost" onClick={() => toast.info("Sync finished")}>Info</Button>
      <Toaster position="bottom-right" />
    </div>
  );
}`,
      },
    },
  },
};

// an action button inside the toast
export const WithAction: Story = {
  tags: ["!dev"],
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() =>
          toast("Member removed", {
            description: "Jonas Weber no longer has access.",
            action: {
              label: "Undo",
              onClick: () => toast.success("Restored Jonas’s access"),
            },
          })
        }
      >
        Remove member
      </Button>
      <DemoToaster />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Button, Toaster, toast } from "@bpdm/ui";

export function Example() {
  return (
    <>
      <Button
        onClick={() =>
          toast("Member removed", {
            description: "Jonas Weber no longer has access.",
            action: { label: "Undo", onClick: () => restore() },
          })
        }
      >
        Remove member
      </Button>
      <Toaster position="bottom-right" />
    </>
  );
}`,
      },
    },
  },
};

// loading → success/error when the promise settles
export const PromiseToast: Story = {
  tags: ["!dev"],
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() =>
          toast.promise(
            new Promise<void>((resolve) => setTimeout(resolve, 2000)),
            {
              loading: "Deploying build #483…",
              success: "Build #483 deployed",
              error: "Deploy failed",
            },
          )
        }
      >
        Deploy (resolves)
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          toast.promise(
            new Promise<void>((_, reject) => setTimeout(reject, 2000)),
            {
              loading: "Deploying build #484…",
              success: "Build #484 deployed",
              error: "Deploy failed — see the logs",
            },
          )
        }
      >
        Deploy (rejects)
      </Button>
      <DemoToaster />
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Button, Toaster, toast } from "@bpdm/ui";

export function Example() {
  return (
    <>
      <Button
        onClick={() =>
          toast.promise(deploy(), {
            loading: "Deploying build #483…",
            success: "Build #483 deployed",
            error: "Deploy failed",
          })
        }
      >
        Deploy
      </Button>
      <Toaster position="bottom-right" />
    </>
  );
}`,
      },
    },
  },
};

// pick any of the six dock positions
export const Positions: Story = {
  tags: ["!dev"],
  render: () => {
    const [position, setPosition] = useState<ToastPosition>("bottom-right");
    return (
      <div className="grid w-fit grid-cols-3 gap-2">
        {POSITIONS.map((p) => (
          <Button
            key={p}
            size="sm"
            variant={p === position ? "primary" : "ghost"}
            onClick={() => {
              setPosition(p);
              setOwnerPosition?.(p);
              toast.info(`Docked ${p}`, { description: "Swipe to dismiss." });
            }}
          >
            {p}
          </Button>
        ))}
        <DemoToaster position={position} />
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        code: `import { Button, Toaster, toast } from "@bpdm/ui";

export function Example() {
  return (
    <>
      <Button onClick={() => toast.info("Docked top-center", { description: "Swipe to dismiss." })}>
        Show toast
      </Button>
      <Toaster position="top-center" />
    </>
  );
}`,
      },
    },
  },
};
