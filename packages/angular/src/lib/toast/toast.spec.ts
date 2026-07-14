import { ApplicationRef, Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  BpdmToast,
  BpdmToaster,
  type ToastMessages,
  type ToastPosition,
} from "./toast";

@Component({
  imports: [BpdmToaster],
  template: `<bpdm-toaster [position]="position()" [messages]="messages()" />`,
})
class ToasterHost {
  readonly position = signal<ToastPosition>("bottom-right");
  readonly messages = signal<Partial<ToastMessages>>({});
}

const macrotask = (ms = 0) => new Promise<void>((r) => setTimeout(r, ms));

async function settle(): Promise<void> {
  const app = TestBed.inject(ApplicationRef);
  app.tick();
  await macrotask();
  app.tick();
}

const items = () => Array.from(document.querySelectorAll("bpdm-toast-item"));

describe("BpdmToast (service store)", () => {
  let svc: BpdmToast;
  beforeEach(() => {
    svc = TestBed.inject(BpdmToast);
  });

  it("show/success/error/warning/info add records with the right variant", () => {
    svc.show("A");
    expect(svc.toasts().length).toBe(1);
    expect(svc.toasts()[0].variant).toBe("default");

    svc.success("S");
    svc.error("E");
    svc.warning("W");
    svc.info("I");
    const variants = svc.toasts().map((t) => t.variant);
    // newest first
    expect(variants).toEqual(["info", "warning", "error", "success", "default"]);
    expect(svc.toasts()[0].title).toBe("I");
  });

  it("upserts by id — reusing an id updates in place instead of stacking", () => {
    svc.show("First", { id: "x" });
    svc.success("Second", { id: "x" });
    expect(svc.toasts().length).toBe(1);
    expect(svc.toasts()[0].title).toBe("Second");
    expect(svc.toasts()[0].variant).toBe("success");
  });

  it("dismiss(id) removes one; dismiss() clears all", () => {
    const a = svc.show("A");
    svc.show("B");
    expect(svc.toasts().length).toBe(2);

    svc.dismiss(a);
    expect(svc.toasts().length).toBe(1);
    expect(svc.toasts()[0].title).toBe("B");

    svc.dismiss();
    expect(svc.toasts().length).toBe(0);
  });

  it("promise shows a sticky loading toast, then resolves to success", async () => {
    let resolve!: (v: string) => void;
    const p = new Promise<string>((r) => (resolve = r));
    svc.promise(p, { loading: "Saving", success: (d) => `Saved ${d}`, error: "Failed" });

    expect(svc.toasts().length).toBe(1);
    expect(svc.toasts()[0].loading).toBe(true);
    expect(svc.toasts()[0].variant).toBe("default");
    expect(svc.toasts()[0].dismissible).toBe(false);

    resolve("ok");
    await p;
    await Promise.resolve();

    expect(svc.toasts()[0].loading).toBe(false);
    expect(svc.toasts()[0].variant).toBe("success");
    expect(svc.toasts()[0].title).toBe("Saved ok");
  });

  it("promise resolves to error when the promise rejects", async () => {
    let reject!: (e: unknown) => void;
    const p = new Promise<string>((_, r) => (reject = r));
    svc.promise(p, { loading: "L", success: "S", error: (e) => `Err ${e}` });

    reject("bad");
    await p.catch(() => {});
    await Promise.resolve();

    expect(svc.toasts()[0].variant).toBe("error");
    expect(svc.toasts()[0].title).toBe("Err bad");
  });
});

describe("BpdmToaster (rendering)", () => {
  let svc: BpdmToast;
  beforeEach(() => {
    svc = TestBed.inject(BpdmToast);
  });
  afterEach(() => {
    document.querySelectorAll(".cdk-overlay-container").forEach((n) => n.remove());
  });

  it("renders a fired toast — title, description, action and close button", async () => {
    const fixture = TestBed.createComponent(ToasterHost);
    fixture.detectChanges();
    await settle();

    const onClick = vi.fn();
    svc.success("Saved", { description: "Your changes are live.", action: { label: "Undo", onClick } });
    await settle();

    const item = items()[0];
    expect(item).toBeTruthy();
    expect(item.textContent).toContain("Saved");
    expect(item.textContent).toContain("Your changes are live.");

    const actionBtn = Array.from(item.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Undo"),
    ) as HTMLButtonElement;
    expect(actionBtn).toBeTruthy();
    actionBtn.click();
    expect(onClick).toHaveBeenCalledTimes(1);

    expect(item.querySelector('button[aria-label="Dismiss"]')).toBeTruthy();
  });

  it("localizes the close button aria-label via [messages]", async () => {
    const fixture = TestBed.createComponent(ToasterHost);
    fixture.detectChanges();
    await settle();

    svc.show("Hi");
    await settle();
    expect(document.querySelector('button[aria-label="Dismiss"]')).toBeTruthy();

    fixture.componentInstance.messages.set({ dismiss: "Schließen" });
    await settle();
    expect(document.querySelector('button[aria-label="Schließen"]')).toBeTruthy();
    expect(document.querySelector('button[aria-label="Dismiss"]')).toBeNull();
  });

  it("localizes the region label via [messages]", async () => {
    const fixture = TestBed.createComponent(ToasterHost);
    fixture.detectChanges();
    await settle();

    expect(document.querySelector('[role="region"][aria-label="Notifications"]')).toBeTruthy();

    fixture.componentInstance.messages.set({ regionLabel: "Benachrichtigungen" });
    fixture.detectChanges();
    await settle();
    expect(
      document.querySelector('[role="region"][aria-label="Benachrichtigungen"]'),
    ).toBeTruthy();
    expect(document.querySelector('[role="region"][aria-label="Notifications"]')).toBeNull();
  });

  it("marks the viewport a labelled region and error toasts as assertive alerts", async () => {
    const fixture = TestBed.createComponent(ToasterHost);
    fixture.detectChanges();
    await settle();

    expect(document.querySelector('[role="region"][aria-label="Notifications"]')).toBeTruthy();

    svc.error("Boom");
    await settle();
    const item = items()[0];
    expect(item.getAttribute("role")).toBe("alert");
    expect(item.getAttribute("aria-live")).toBe("assertive");

    svc.dismiss();
    svc.success("Yay");
    await settle();
    expect(items()[0].getAttribute("role")).toBe("status");
    expect(items()[0].getAttribute("aria-live")).toBe("polite");
  });

  it("auto-dismisses after its duration", async () => {
    const fixture = TestBed.createComponent(ToasterHost);
    fixture.detectChanges();
    await settle();

    svc.show("Bye", { duration: 20 });
    await settle();
    expect(items().length).toBe(1);

    // wait out the duration + the exit-animation fallback, then flush CD
    await macrotask(300);
    TestBed.inject(ApplicationRef).tick();
    expect(items().length).toBe(0);
    expect(svc.toasts().length).toBe(0);
  });

  it("pauses auto-dismiss while a toast is keyboard-focused, and resumes on blur", async () => {
    const fixture = TestBed.createComponent(ToasterHost);
    fixture.detectChanges();
    await settle();

    svc.show("Focused", { duration: 80 });
    await settle();
    const item = items()[0] as HTMLElement;
    expect(item).toBeTruthy();

    // focus into the toast → the auto-dismiss timer is cleared (parity with hover)
    item.dispatchEvent(new FocusEvent("focusin"));

    await macrotask(200); // well past the 80ms duration
    TestBed.inject(ApplicationRef).tick();
    expect(items().length).toBe(1); // still there — focus paused it

    // focus leaves the toast entirely (no relatedTarget) → timer resumes, dismisses
    item.dispatchEvent(new FocusEvent("focusout"));
    await macrotask(350); // remaining duration + exit-animation fallback
    TestBed.inject(ApplicationRef).tick();
    expect(items().length).toBe(0);
    expect(svc.toasts().length).toBe(0);
  });

  it("keeps the timer paused when focus only moves between the toast's own controls", async () => {
    const fixture = TestBed.createComponent(ToasterHost);
    fixture.detectChanges();
    await settle();

    svc.show("Two buttons", { duration: 80, action: { label: "Undo", onClick: () => {} } });
    await settle();
    const item = items()[0] as HTMLElement;

    item.dispatchEvent(new FocusEvent("focusin"));
    // focusout whose relatedTarget is still inside the toast must NOT resume
    const inner = item.querySelector("button") as HTMLElement;
    item.dispatchEvent(new FocusEvent("focusout", { relatedTarget: inner } as FocusEventInit));

    await macrotask(200);
    TestBed.inject(ApplicationRef).tick();
    expect(items().length).toBe(1); // still paused — focus never left the toast
  });

  it("a sticky toast (Infinity) does not auto-dismiss", async () => {
    const fixture = TestBed.createComponent(ToasterHost);
    fixture.detectChanges();
    await settle();

    svc.show("Stay", { duration: Infinity });
    await settle();
    expect(items().length).toBe(1);
    // no countdown bar rendered for sticky toasts
    expect(items()[0].querySelector("[data-bpdm-countdown]")).toBeNull();

    await macrotask(120);
    TestBed.inject(ApplicationRef).tick();
    expect(items().length).toBe(1);
  });
});
