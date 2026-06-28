'use client';

import { useEffect } from 'react';
import { Toaster, toast } from '@bpdm/ui/toast';

/**
 * Mounts our own bpdm/ui Toaster (top-right) and dogfoods it: whenever a user
 * clicks a Fumadocs copy button (code block "Copy Text" or a heading anchor),
 * we surface a bpdm toast instead of relying on the silent built-in feedback.
 * Click delegation is used because navigator.clipboard.writeText doesn't fire a
 * native `copy` event. Same id → repeat clicks update in place, never stack.
 */
export function CopyToast() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = e.target as HTMLElement | null;
      const btn = el?.closest('button[aria-label^="Copy"]');
      if (!btn) return;
      const label = btn.getAttribute('aria-label') ?? '';
      const message = /anchor|link/i.test(label) ? 'Link copied' : 'Copied to clipboard';
      toast.success(message, { id: 'copy', duration: 2000 });
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return <Toaster position="top-right" />;
}
