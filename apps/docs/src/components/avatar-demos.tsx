'use client';

import type { ReactNode } from 'react';
import { Avatar, AvatarGroup } from '@bpdm/ui/avatar';
import { NotificationBadge } from '@bpdm/ui/badge';

/** Stable royalty-free placeholder faces; if they ever fail to load the Avatar
 *  gracefully falls back to initials, so the demos render offline too. */
const PEOPLE = [
  { name: 'Aria Lindqvist', src: 'https://i.pravatar.cc/150?img=47' },
  { name: 'Theo Brandt', src: 'https://i.pravatar.cc/150?img=12' },
  { name: 'Lena Cho', src: 'https://i.pravatar.cc/150?img=32' },
  { name: 'Mateo Silva', src: 'https://i.pravatar.cc/150?img=15' },
  { name: 'Ines Vidal', src: 'https://i.pravatar.cc/150?img=45' },
  { name: 'Sam Reyes', src: 'https://i.pravatar.cc/150?img=8' },
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
      {/* no name → default user icon */}
      <Avatar size="lg" />
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
