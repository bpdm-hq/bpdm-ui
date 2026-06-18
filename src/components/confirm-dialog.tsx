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
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
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
        title={o.title ?? "Are you sure?"}
        description={o.description}
        footer={
          <>
            <Button variant="ghost" onClick={() => settle(false)}>
              {o.cancelText ?? "Cancel"}
            </Button>
            <Button
              variant={o.destructive ? "destructive" : "primary"}
              onClick={() => settle(true)}
            >
              {o.confirmText ?? "Confirm"}
            </Button>
          </>
        }
      />
    </ConfirmContext.Provider>
  );
}
