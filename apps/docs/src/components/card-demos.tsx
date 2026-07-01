'use client';

import { Card, CardMedia, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@bpdm/ui/card';
import { Button } from '@bpdm/ui/button';
import { Badge } from '@bpdm/ui/badge';
import { Tabs } from '@bpdm/ui/tabs';

const MEDIA = 'bg-gradient-to-br from-primary/30 via-primary/10 to-transparent';

// ── demos ─────────────────────────────────────────────────────────────────────
export function CardUsageDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Weekly report</CardTitle>
        <CardDescription>Your team's activity this week.</CardDescription>
      </CardHeader>
      <CardContent>Deploys, reviews, and open tasks at a glance.</CardContent>
      <CardFooter divider>
        <Button size="sm">View report</Button>
        <Button size="sm" variant="secondary" appearance="ghost">Dismiss</Button>
      </CardFooter>
    </Card>
  );
}

export function CardMediaDemo() {
  return (
    <Card hoverable className="w-full max-w-sm">
      <CardMedia aspect="video" className={MEDIA} />
      <CardHeader action={<Badge variant="success" appearance="soft" dot>Live</Badge>}>
        <CardTitle>Release 2.4</CardTitle>
        <CardDescription>Shipped 3 hours ago</CardDescription>
      </CardHeader>
      <CardContent>Dark mode, faster search, and a dozen fixes.</CardContent>
      <CardFooter divider>
        <Button size="sm" variant="secondary" appearance="outline">Changelog</Button>
      </CardFooter>
    </Card>
  );
}

export function CardVariantsDemo() {
  const sample = (variant: 'elevated' | 'outlined' | 'soft') => (
    <Card variant={variant} className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="capitalize">{variant}</CardTitle>
        <CardDescription>Surface style: {variant}.</CardDescription>
      </CardHeader>
      <CardContent>The same card in the {variant} look.</CardContent>
    </Card>
  );
  return (
    <Tabs
      className="w-full max-w-sm self-start"
      listClassName="mb-2"
      defaultValue="elevated"
      items={[
        { value: 'elevated', label: 'Elevated', content: sample('elevated') },
        { value: 'outlined', label: 'Outlined', content: sample('outlined') },
        { value: 'soft', label: 'Soft', content: sample('soft') },
      ]}
    />
  );
}

export function CardInteractiveDemo() {
  return (
    <Card hoverable interactive asChild className="w-full max-w-sm">
      <a href="#usage">
        <CardHeader>
          <CardTitle>Open the dashboard</CardTitle>
          <CardDescription>The whole card is a single link — hover and focus it.</CardDescription>
        </CardHeader>
        <CardContent>Great for tiles that navigate on click.</CardContent>
      </a>
    </Card>
  );
}

export function CardHorizontalDemo() {
  return (
    <Card hoverable className="flex w-full max-w-md flex-row">
      <div className={`w-28 shrink-0 ${MEDIA}`} />
      <div className="min-w-0 flex-1">
        <CardHeader>
          <CardTitle>Design tokens</CardTitle>
          <CardDescription>Guide · 6 min read</CardDescription>
        </CardHeader>
        <CardContent>How the theme is generated from one token set.</CardContent>
      </div>
    </Card>
  );
}

export function CardGridDemo() {
  const items = [
    { title: 'Analytics', body: 'Traffic, funnels, retention.' },
    { title: 'Billing', body: 'Plans, invoices, usage.' },
    { title: 'Team', body: 'Members, roles, invites.' },
  ];
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {items.map((it) => (
        <Card key={it.title} hoverable>
          <CardHeader>
            <CardTitle>{it.title}</CardTitle>
          </CardHeader>
          <CardContent>{it.body}</CardContent>
        </Card>
      ))}
    </div>
  );
}
