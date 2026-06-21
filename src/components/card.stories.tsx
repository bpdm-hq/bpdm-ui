import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
} from "@storybook/addon-docs/blocks";
import { MoreHorizontal } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMedia,
  CardTitle,
} from "./card";
import { Button } from "./button";
import { Badge } from "./badge";

const usage = `
Composable surface for grouping content. Three looks (\`elevated\`, \`outlined\`,
\`soft\`), an optional edge-to-edge \`CardMedia\` band (image zooms on hover), and
\`hoverable\` / \`interactive\` props for lift + press feedback. Compose
\`CardMedia\` / \`CardHeader\` / \`CardTitle\` / \`CardDescription\` / \`CardContent\` / \`CardFooter\`.

\`\`\`tsx
import { Card, CardHeader, CardTitle, CardContent } from "@bpdm/ui";

<Card>
  <CardHeader><CardTitle>Release notes</CardTitle></CardHeader>
  <CardContent>What changed in version 2.4…</CardContent>
</Card>
\`\`\`
`;

// license-free gradient media (inline SVG data URI) — no external images
function media(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const a = h % 360;
  const b = (a + 48) % 360;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='340'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='hsl(${a} 68% 24%)'/><stop offset='1' stop-color='hsl(${b} 62% 13%)'/></linearGradient></defs><rect width='600' height='340' fill='url(#g)'/><circle cx='175' cy='150' r='120' fill='hsl(${a} 85% 58%)' opacity='0.28'/><circle cx='470' cy='255' r='72' fill='hsl(${b} 85% 62%)' opacity='0.22'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const BODY =
  "A clear, focused summary lives here — enough context to scan quickly without overwhelming the reader. Cards keep related content together with consistent spacing.";

const meta: Meta<typeof Card> = {
  title: "Data Display/Card",
  component: Card,
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
    variant: { control: "inline-radio", options: ["elevated", "outlined", "soft"] },
    hoverable: { control: "boolean" },
    interactive: { control: "boolean" },
  },
  args: { variant: "elevated", hoverable: false, interactive: false },
  render: (args) => (
    <Card {...args} className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Project Atlas</CardTitle>
        <CardDescription>Workspace · 12 members</CardDescription>
      </CardHeader>
      <CardContent>{BODY}</CardContent>
    </Card>
  ),
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Playground: Story = {};

// title + body only
export const Simple: Story = {
  render: () => (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Release notes</CardTitle>
      </CardHeader>
      <CardContent>
        Version 2.4 adds keyboard navigation across the console, a faster table, and
        four built-in themes. Existing settings carry over automatically.
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Card, CardHeader, CardTitle, CardContent } from "@bpdm/ui";

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Release notes</CardTitle>
      </CardHeader>
      <CardContent>
        Version 2.4 adds keyboard navigation across the console, a faster table, and
        four built-in themes. Existing settings carry over automatically.
      </CardContent>
    </Card>
  );
}`,
      },
    },
  },
};

// media + subtitle + footer actions
export const Advanced: Story = {
  render: () => (
    <Card hoverable className="w-full max-w-sm">
      <CardMedia src={media("atlas")} alt="" />
      <CardHeader action={<Badge variant="success" appearance="soft">Live</Badge>}>
        <CardTitle>Project Atlas</CardTitle>
        <CardDescription>Updated 2 days ago</CardDescription>
      </CardHeader>
      <CardContent>{BODY}</CardContent>
      <CardFooter>
        <Button variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button className="flex-1">Save</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      source: {
        code: `import {
  Card,
  CardMedia,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
} from "@bpdm/ui";

export function Example() {
  return (
    <Card hoverable className="max-w-sm">
      <CardMedia src="/cover.jpg" alt="" />
      <CardHeader action={<Badge variant="success" appearance="soft">Live</Badge>}>
        <CardTitle>Project Atlas</CardTitle>
        <CardDescription>Updated 2 days ago</CardDescription>
      </CardHeader>
      <CardContent>
        A clear, focused summary lives here — enough context to scan quickly without
        overwhelming the reader.
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="flex-1">Cancel</Button>
        <Button className="flex-1">Save</Button>
      </CardFooter>
    </Card>
  );
}`,
      },
    },
  },
};

// the three looks — shadow vs border vs fill
const VARIANT_COPY = {
  elevated: "Lifts off the page with a soft shadow and no border.",
  outlined: "A flat surface defined by a border — no shadow.",
  soft: "A filled, muted surface — no border or shadow.",
} as const;

export const Variants: Story = {
  render: () => (
    <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
      {(["elevated", "outlined", "soft"] as const).map((variant) => (
        <Card key={variant} variant={variant}>
          <CardHeader>
            <CardTitle className="capitalize">{variant}</CardTitle>
            <CardDescription>variant=&quot;{variant}&quot;</CardDescription>
          </CardHeader>
          <CardContent>{VARIANT_COPY[variant]}</CardContent>
        </Card>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@bpdm/ui";

export function Example() {
  return (
    <div className="flex flex-col gap-4">
      {/* elevated — soft shadow, no border (the default) */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Elevated</CardTitle>
          <CardDescription>variant="elevated"</CardDescription>
        </CardHeader>
        <CardContent>Lifts off the page with a soft shadow and no border.</CardContent>
      </Card>

      {/* outlined — border, no shadow */}
      <Card variant="outlined">
        <CardHeader>
          <CardTitle>Outlined</CardTitle>
          <CardDescription>variant="outlined"</CardDescription>
        </CardHeader>
        <CardContent>A flat surface defined by a border — no shadow.</CardContent>
      </Card>

      {/* soft — filled muted surface */}
      <Card variant="soft">
        <CardHeader>
          <CardTitle>Soft</CardTitle>
          <CardDescription>variant="soft"</CardDescription>
        </CardHeader>
        <CardContent>A filled, muted surface — no border or shadow.</CardContent>
      </Card>
    </div>
  );
}`,
      },
    },
  },
};

// responsive grid of media cards; each lifts + zooms on hover
export const ResponsiveGrid: Story = {
  render: () => (
    <div className="grid w-full max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {["Atlas", "Beacon", "Cobalt", "Drift", "Ember", "Forge"].map((name) => (
        <Card key={name} hoverable>
          <CardMedia src={media(name)} alt="" aspect="video" />
          <CardHeader>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Service · healthy</CardDescription>
          </CardHeader>
          <CardContent>Deploys automatically on every merge to the main branch.</CardContent>
        </Card>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Card, CardMedia, CardHeader, CardTitle, CardDescription, CardContent } from "@bpdm/ui";

const services = ["Atlas", "Beacon", "Cobalt", "Drift", "Ember", "Forge"];

export function Example() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((name) => (
        <Card key={name} hoverable>
          <CardMedia src={\`/covers/\${name}.jpg\`} alt="" aspect="video" />
          <CardHeader>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Service · healthy</CardDescription>
          </CardHeader>
          <CardContent>Deploys automatically on every merge to the main branch.</CardContent>
        </Card>
      ))}
    </div>
  );
}`,
      },
    },
  },
};

// whole card is a link/button — press feedback + focus ring
export const Interactive: Story = {
  tags: ["!dev"],
  render: () => (
    <Card asChild hoverable interactive className="w-full max-w-md">
      <a href="#atlas">
        <CardHeader action={<MoreHorizontal className="size-4 text-muted-foreground" />}>
          <CardTitle>Open Project Atlas →</CardTitle>
          <CardDescription>The entire card is clickable</CardDescription>
        </CardHeader>
        <CardContent>{BODY}</CardContent>
      </a>
    </Card>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@bpdm/ui";
import { MoreHorizontal } from "lucide-react";

export function Example() {
  return (
    <Card asChild hoverable interactive className="max-w-md">
      <a href="/atlas">
        <CardHeader action={<MoreHorizontal className="size-4 text-muted-foreground" />}>
          <CardTitle>Open Project Atlas →</CardTitle>
          <CardDescription>The entire card is clickable</CardDescription>
        </CardHeader>
        <CardContent>A clear, focused summary lives here.</CardContent>
      </a>
    </Card>
  );
}`,
      },
    },
  },
};

// media beside the content (responsive: stacks on small screens)
export const Horizontal: Story = {
  tags: ["!dev"],
  render: () => (
    <Card hoverable className="w-full max-w-2xl sm:flex-row">
      <CardMedia src={media("beacon")} alt="" className="sm:w-2/5 sm:aspect-auto" aspect="video" />
      <div className="flex flex-col">
        <CardHeader>
          <CardTitle>Beacon</CardTitle>
          <CardDescription>Monitoring service</CardDescription>
        </CardHeader>
        <CardContent>
          Real-time health checks across every region, with alerting and a 30-day history.
        </CardContent>
      </div>
    </Card>
  ),
  parameters: {
    docs: {
      source: {
        code: `import { Card, CardMedia, CardHeader, CardTitle, CardDescription, CardContent } from "@bpdm/ui";

export function Example() {
  return (
    <Card hoverable className="sm:flex-row">
      <CardMedia src="/cover.jpg" alt="" className="sm:w-2/5 sm:aspect-auto" aspect="video" />
      <div className="flex flex-col">
        <CardHeader>
          <CardTitle>Beacon</CardTitle>
          <CardDescription>Monitoring service</CardDescription>
        </CardHeader>
        <CardContent>
          Real-time health checks across every region, with alerting and a 30-day history.
        </CardContent>
      </div>
    </Card>
  );
}`,
      },
    },
  },
};
