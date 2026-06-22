import { cn } from "@/lib/utils";

// Shared close "×" for overlay surfaces (Dialog, Drawer). Internal — not part of
// the public API. Slightly lighter stroke than the field clear-× so it reads as a
// quiet corner affordance on a large panel.
export function OverlayClose({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={cn("size-4", className)}>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
