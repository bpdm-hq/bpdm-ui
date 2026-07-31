import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { useScrollLock } from "./hooks";

export interface CreateDialogProps {
  /** Heading for the create popup (from `messages.createTitle`). */
  title: string;
  /** The consumer's form — rendered inside the popup shell. */
  children: ReactNode;
  onCancel: () => void;
}

/**
 * A self-contained popup shell for the "create event" flow. It owns only the
 * chrome — backdrop, focus, Escape/backdrop-to-cancel — and renders whatever
 * form the consumer passes via `renderCreateForm`, so the fields stay 100%
 * customizable and the package keeps zero UI dependencies.
 */
export function CreateDialog({ title, children, onCancel }: CreateDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useScrollLock();

  useEffect(() => {
    // focus the first focusable control in the consumer's form
    panelRef.current
      ?.querySelector<HTMLElement>(
        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
      )
      ?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="bpdm-sch-ov"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bpdm-sch-dlg" style={{ "--c": "var(--primary)" } as CSSProperties} ref={panelRef}>
        <div className="bpdm-sch-dlg-head">
          <div className="bpdm-sch-dlg-titlewrap">
            <span className="bpdm-sch-dlg-bar" aria-hidden="true" />
            <div className="bpdm-sch-dlg-title" role="heading" aria-level={3}>
              {title}
            </div>
          </div>
        </div>
        <div className="bpdm-sch-dlg-body">{children}</div>
      </div>
    </div>
  );
}
