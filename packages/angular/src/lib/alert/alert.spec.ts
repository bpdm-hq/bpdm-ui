import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { BpdmAlert, type AlertMessages } from "./alert";

@Component({
  imports: [BpdmAlert],
  template: `<bpdm-alert variant="error" title="Oops">Something failed</bpdm-alert>`,
})
class HostComponent {}

@Component({
  imports: [BpdmAlert],
  template: `<bpdm-alert variant="success" title="Invite sent" dismissible>Body</bpdm-alert>`,
})
class DismissibleHost {}

@Component({
  imports: [BpdmAlert],
  template: `<bpdm-alert
    variant="info"
    title="Cfg"
    [dismissible]="true"
    [messages]="messages()"
    [live]="live()"
    >Body</bpdm-alert
  >`,
})
class ConfigHost {
  readonly messages = signal<Partial<AlertMessages>>({});
  readonly live = signal<"assertive" | "polite" | "off" | undefined>(undefined);
}

/** Dispatch a `transitionend` for a given CSS property (env-agnostic — no `TransitionEvent`). */
function fireTransitionEnd(el: HTMLElement, propertyName: string): void {
  const ev = new Event("transitionend", { bubbles: true });
  Object.defineProperty(ev, "propertyName", { value: propertyName });
  el.dispatchEvent(ev);
}

describe("BpdmAlert", () => {
  it("renders a titled, role=alert box with the variant accent", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const box = host.querySelector('[role="alert"]') as HTMLElement;

    expect(box).toBeTruthy();
    expect(box.className).toContain("var(--destructive)"); // error accent (destructive color-mix bg/border)
    expect(host.textContent).toContain("Oops"); // title
    expect(host.textContent).toContain("Something failed"); // body
  });

  it("shows the dismiss button when `dismissible` is set as a bare attribute", () => {
    const fixture = TestBed.createComponent(DismissibleHost);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Dismiss"]',
    ) as HTMLButtonElement | null;
    expect(button).toBeTruthy(); // booleanAttribute coercion → true
  });

  it("dismiss aria-label defaults to Dismiss and is overridable via [messages]", () => {
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('button[aria-label="Dismiss"]')).toBeTruthy();

    fixture.componentInstance.messages.set({ dismiss: "Schließen" });
    fixture.detectChanges();
    expect(host.querySelector('button[aria-label="Schließen"]')).toBeTruthy();
    expect(host.querySelector('button[aria-label="Dismiss"]')).toBeFalsy();
  });

  it("emits closed once the collapse (grid-template-rows) transition ends", () => {
    const fixture = TestBed.createComponent(DismissibleHost);
    fixture.detectChanges();
    const instance = fixture.debugElement.query(By.directive(BpdmAlert)).componentInstance as BpdmAlert;
    const spy = vi.fn();
    instance.closed.subscribe(spy);

    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Dismiss"]',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const alertEl = fixture.nativeElement.querySelector("bpdm-alert") as HTMLElement;
    fireTransitionEnd(alertEl, "opacity"); // unrelated property → no emit
    expect(spy).not.toHaveBeenCalled();
    fireTransitionEnd(alertEl, "grid-template-rows"); // the collapse transition → emit
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("maps live to the live-region role (default role=alert, polite→status, off→none)", () => {
    const fixture = TestBed.createComponent(ConfigHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('[role="alert"]')).toBeTruthy(); // default unchanged

    fixture.componentInstance.live.set("polite");
    fixture.detectChanges();
    expect(host.querySelector('[role="status"]')).toBeTruthy();
    expect(host.querySelector('[role="alert"]')).toBeFalsy();

    fixture.componentInstance.live.set("off");
    fixture.detectChanges();
    expect(host.querySelector('[role="alert"]')).toBeFalsy();
    expect(host.querySelector('[role="status"]')).toBeFalsy();
  });
});
