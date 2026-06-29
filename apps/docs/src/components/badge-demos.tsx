'use client';

import { useState } from 'react';
import { Bell, Mail } from 'lucide-react';
import { Badge, NotificationBadge, type BadgeVariant } from '@bpdm/ui/badge';
import { Button } from '@bpdm/ui/button';

const TONES: BadgeVariant[] = [
  'neutral',
  'secondary',
  'primary',
  'success',
  'warning',
  'info',
  'help',
  'destructive',
  'contrast',
];

export function BadgeBasicDemo() {
  return <Badge variant="success">Active</Badge>;
}

export function BadgeVariantsDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {TONES.map((v) => (
        <Badge key={v} variant={v}>
          {v}
        </Badge>
      ))}
    </div>
  );
}

export function BadgeAppearancesDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      <Badge variant="primary" appearance="soft">
        Soft
      </Badge>
      <Badge variant="primary" appearance="solid">
        Solid
      </Badge>
      <Badge variant="primary" appearance="outline">
        Outline
      </Badge>
      <Badge variant="primary" appearance="ghost" dot>
        Ghost
      </Badge>
    </div>
  );
}

export function BadgeSizesDemo() {
  return (
    <div className="flex items-center justify-center gap-2.5">
      <Badge variant="primary" size="sm">
        Small
      </Badge>
      <Badge variant="primary" size="md">
        Medium
      </Badge>
    </div>
  );
}

export function BadgeStatusDemo() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Badge variant="success" dot pulse>
          Live
        </Badge>
        <Badge variant="info" dot pulse>
          Deploying
        </Badge>
        <Badge variant="warning" dot>
          Degraded
        </Badge>
        <Badge variant="destructive" dot>
          Offline
        </Badge>
        <Badge variant="neutral" dot>
          Draft
        </Badge>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Badge appearance="ghost" variant="success" dot>
          Healthy
        </Badge>
        <Badge appearance="ghost" variant="info" dot pulse>
          Syncing
        </Badge>
        <Badge appearance="ghost" variant="destructive" dot>
          Blocked
        </Badge>
      </div>
    </div>
  );
}

const INITIAL_TAGS = ['Frontend', 'Backend', 'Design', 'Infra', 'Docs'];

export function BadgeRemovableDemo() {
  const [tags, setTags] = useState(INITIAL_TAGS);
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex min-h-7 flex-wrap items-center justify-center gap-2">
        {tags.map((t) => (
          <Badge key={t} variant="neutral" onRemove={() => setTags((cur) => cur.filter((x) => x !== t))}>
            {t}
          </Badge>
        ))}
      </div>
      <Button size="sm" variant="secondary" appearance="ghost" onClick={() => setTags(INITIAL_TAGS)}>
        Reset
      </Button>
    </div>
  );
}

export function BadgeNotificationsDemo() {
  const [count, setCount] = useState(8);
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-5">
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
      </div>
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
}

export function BadgeLinkDemo() {
  return (
    <Badge asChild variant="primary" appearance="soft">
      <a href="#badge">View docs →</a>
    </Badge>
  );
}
