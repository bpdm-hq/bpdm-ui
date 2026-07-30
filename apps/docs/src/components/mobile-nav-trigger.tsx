'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';
import { useSidebar } from 'fumadocs-ui/components/sidebar/base';

/**
 * Mobile-only sidebar toggle. Our custom <SiteHeader /> replaces Fumadocs' nav —
 * which on mobile is where the sidebar (component nav) hamburger normally lives —
 * so without this the docs tree is unreachable on phones. This component renders
 * inside <DocsLayout> (so it can read the sidebar context via `useSidebar`) but
 * portals its button into a slot in the header, so the control sits in the header
 * visually while still driving Fumadocs' drawer.
 */
export function MobileNavTrigger() {
  const { open, setOpen } = useSidebar();
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSlot(document.getElementById('fd-sidebar-trigger-slot'));
  }, []);

  if (!slot) return null;

  return createPortal(
    <button
      type="button"
      onClick={() => setOpen(v => !v)}
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
      className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-fd-border text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
    >
      {open ? <X className="size-5" /> : <Menu className="size-5" />}
    </button>,
    slot,
  );
}
