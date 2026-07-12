import * as React from "react";
import { Dialog } from "./dialog";
import { Button } from "./button";

export interface ConfirmOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** Style the confirm button as destructive (red). */
  destructive?: boolean;
}

// --- i18n ---
export interface ConfirmMessages {
  /** Fallback title when a call omits `title`. */
  title: string;
  /** Confirm button text when a call omits `confirmText`. */
  confirm: string;
  /** Cancel button text when a call omits `cancelText`. */
  cancel: string;
  /** aria-label for the dialog's close button. */
  close: string;
}

export const DEFAULT_CONFIRM_MESSAGES: ConfirmMessages = {
  title: "Are you sure?",
  confirm: "Confirm",
  cancel: "Cancel",
  close: "Close",
};

type ConfirmFn = (options?: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmFn | null>(null);

/** Imperatively ask for confirmation — returns a Promise<boolean>. */
export function useConfirm(): ConfirmFn {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
  return ctx;
}

/**
 * Wrap the app once; then call `const confirm = useConfirm()` anywhere and
 * `await confirm({ title, description, destructive })`. Resolves true on confirm,
 * false on cancel / outside-click / ESC. Built on the Dialog.
 */
export function ConfirmProvider({
  children,
  messages,
}: {
  children: React.ReactNode;
  /** App-wide localizable defaults; per-call `options` still win. */
  messages?: Partial<ConfirmMessages>;
}) {
  const t = { ...DEFAULT_CONFIRM_MESSAGES, ...messages };
  const [state, setState] = React.useState<{
    open: boolean;
    options: ConfirmOptions;
    resolve: (v: boolean) => void;
  } | null>(null);

  const confirm = React.useCallback<ConfirmFn>(
    (options = {}) =>
      new Promise<boolean>((resolve) => {
        setState({ open: true, options, resolve });
      }),
    [],
  );

  const settle = (result: boolean) => {
    state?.resolve(result);
    setState((s) => (s ? { ...s, open: false } : null));
  };

  const o = state?.options ?? {};

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={state?.open ?? false}
        onOpenChange={(open) => {
          if (!open) settle(false);
        }}
        size="sm"
        title={o.title ?? t.title}
        description={o.description}
        messages={{ close: t.close }}
        footer={
          <>
            <Button variant="secondary" appearance="ghost" onClick={() => settle(false)}>
              {o.cancelText ?? t.cancel}
            </Button>
            <Button
              variant={o.destructive ? "destructive" : "primary"}
              onClick={() => settle(true)}
            >
              {o.confirmText ?? t.confirm}
            </Button>
          </>
        }
      />
    </ConfirmContext.Provider>
  );
}
