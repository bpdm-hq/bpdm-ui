'use client';

import type { ReactNode } from 'react';
import { Building2 } from 'lucide-react';
import { Avatar, AvatarGroup } from '@bpdm/ui/avatar';
import { NotificationBadge } from '@bpdm/ui/badge';

/** DiceBear generated avatars (CC0 "thumbs" style) — no real people, no licensing
 *  concerns, and stable per seed. If they ever fail to load the Avatar gracefully
 *  falls back to initials, so the demos still render offline. */
const img = (seed: string) => `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;

const PEOPLE = [
  { name: 'Aria Lindqvist', src: img('Aria') },
  { name: 'Theo Brandt', src: img('Theo') },
  { name: 'Lena Cho', src: img('Lena') },
  { name: 'Mateo Silva', src: img('Mateo') },
  { name: 'Ines Vidal', src: img('Ines') },
  { name: 'Sam Reyes', src: img('Sam') },
];

function Row({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-end justify-center gap-5">{children}</div>;
}

export function AvatarUsageDemo() {
  return (
    <Row>
      <Avatar name="Aria Lindqvist" src={PEOPLE[0].src} size="lg" status="online" />
      <Avatar name="Theo Brandt" size="lg" />
    </Row>
  );
}

export function AvatarInitialsDemo() {
  return (
    <Row>
      {['Aria Lindqvist', 'Theo Brandt', 'Lena Cho', 'Mateo Silva', 'Ines Vidal'].map((name) => (
        <Avatar key={name} name={name} size="lg" />
      ))}
    </Row>
  );
}

export function AvatarFallbackDemo() {
  return (
    <Row>
      {/* image fails → initials */}
      <Avatar name="Clara Bauer" src="https://invalid.example/none.jpg" size="lg" />
      {/* no name, no icon → built-in user icon */}
      <Avatar size="lg" />
      {/* no name + custom icon → your icon */}
      <Avatar size="lg" icon={<Building2 />} />
      {/* neutral (no auto-tint) */}
      <Avatar size="lg" name="JD" colorful={false} />
    </Row>
  );
}

export function AvatarSizesDemo() {
  return (
    <Row>
      {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
        <Avatar key={size} name="Aria Lindqvist" src={PEOPLE[0].src} size={size} />
      ))}
    </Row>
  );
}

export function AvatarShapesDemo() {
  return (
    <Row>
      <Avatar name="Aria Lindqvist" src={PEOPLE[0].src} size="lg" shape="circle" />
      <Avatar name="Theo Brandt" size="lg" shape="circle" />
      <Avatar name="Aria Lindqvist" src={PEOPLE[0].src} size="lg" shape="square" />
      <Avatar name="Theo Brandt" size="lg" shape="square" />
    </Row>
  );
}

export function AvatarStatusDemo() {
  return (
    <Row>
      <Avatar name="Aria Lindqvist" src={PEOPLE[0].src} size="lg" status="online" />
      <Avatar name="Theo Brandt" size="lg" status="busy" />
      <Avatar name="Lena Cho" src={PEOPLE[2].src} size="lg" status="away" />
      <Avatar name="Mateo Silva" size="lg" status="offline" />
    </Row>
  );
}

export function AvatarGroupDemo() {
  return (
    <div className="flex flex-col items-center gap-6">
      <AvatarGroup max={4}>
        {PEOPLE.map((p) => (
          <Avatar key={p.name} name={p.name} src={p.src} />
        ))}
      </AvatarGroup>
      <AvatarGroup max={5} size="sm">
        {PEOPLE.concat({ name: 'Nina Berg', src: '' }).map((p) => (
          <Avatar key={p.name} name={p.name} />
        ))}
      </AvatarGroup>
    </div>
  );
}

export function AvatarBadgeDemo() {
  return (
    <Row>
      <NotificationBadge count={4}>
        <Avatar name="Aria Lindqvist" src={PEOPLE[0].src} size="lg" />
      </NotificationBadge>
      <NotificationBadge count={128} max={99}>
        <Avatar name="Lena Cho" src={PEOPLE[2].src} size="lg" />
      </NotificationBadge>
      <NotificationBadge dot variant="success">
        <Avatar name="Theo Brandt" size="lg" />
      </NotificationBadge>
    </Row>
  );
}
