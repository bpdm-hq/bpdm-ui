import * as React from "react";
import { Dialog } from "./dialog";

export interface DialogOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
}

/** Content to render — a node, or a function given a `close` callback. */
export type DynamicDialogContent =
  | React.ReactNode
  | ((api: { close: () => void }) => React.ReactNode);

interface DialogService {
  /** Open a dialog with arbitrary content; returns an id you can `close()`. */
  open: (content: DynamicDialogContent, options?: DialogOptions) => string;
  close: (id: string) => void;
}

const DialogServiceContext = React.createContext<DialogService | null>(null);

/** Imperatively open dialogs with any content from anywhere in the tree. */
export function useDialog(): DialogService {
  const ctx = React.useContext(DialogServiceContext);
  if (!ctx) throw new Error("useDialog must be used within <DialogProvider>");
  return ctx;
}

/**
 * Wrap the app once; then `const dialog = useDialog()` and
 * `dialog.open(({ close }) => <Form onDone={close} />, { title })` from anywhere —
 * no per-dialog open state or prop drilling. Supports multiple stacked dialogs.
 */
export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<
    { id: string; content: DynamicDialogContent; options: DialogOptions }[]
  >([]);
  const idRef = React.useRef(0);

  const close = React.useCallback((id: string) => {
    setItems((s) => s.filter((i) => i.id !== id));
  }, []);

  const open = React.useCallback((content: DynamicDialogContent, options: DialogOptions = {}) => {
    const id = String(++idRef.current);
    setItems((s) => [...s, { id, content, options }]);
    return id;
  }, []);

  const service = React.useMemo(() => ({ open, close }), [open, close]);

  return (
    <DialogServiceContext.Provider value={service}>
      {children}
      {items.map((item, index) => {
        const isTop = index === items.length - 1;
        return (
        <Dialog
          key={item.id}
          open
          // Only the topmost dialog may be dismissed by Esc / outside-click — the
          // ones beneath ignore those, so interacting with (or closing) an upper
          // dialog never tears down the stack below it.
          onEscapeKeyDown={isTop ? undefined : (e) => e.preventDefault()}
          onInteractOutside={isTop ? undefined : (e) => e.preventDefault()}
          onOpenChange={(o) => {
            if (!o && isTop) close(item.id);
          }}
          title={item.options.title}
          description={item.options.description}
          size={item.options.size ?? "md"}
          footer={item.options.footer}
        >
          {typeof item.content === "function"
            ? item.content({ close: () => close(item.id) })
            : item.content}
        </Dialog>
        );
      })}
    </DialogServiceContext.Provider>
  );
}
