import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { vi } from "vitest";
import { BpdmBadge, BpdmNotificationBadge, type BadgeMessages } from "./badge";

@Component({
  imports: [BpdmBadge],
  template: `<bpdm-badge variant="success" appearance="solid">Active</bpdm-badge>`,
})
class BadgeHost {}

@Component({
  imports: [BpdmBadge],
  template: `<bpdm-badge variant="primary" removable>Frontend</bpdm-badge>`,
})
class RemovableHost {}

@Component({
  imports: [BpdmBadge],
  template: `<bpdm-badge removable [messages]="messages()">Frontend</bpdm-badge>`,
})
class MessagesHost {
  readonly messages = signal<Partial<BadgeMessages>>({});
}

@Component({
  imports: [BpdmNotificationBadge],
  template: `<bpdm-notification-badge [count]="128" [max]="99">x</bpdm-notification-badge>`,
})
class NotifHost {}

@Component({
  imports: [BpdmNotificationBadge],
  template: `<bpdm-notification-badge
    [count]="count()"
    [max]="max()"
    [dot]="dot()"
    [showZero]="showZero()"
    [ariaLabel]="ariaLabel()"
    >x</bpdm-notification-badge
  >`,
})
class NotifConfigHost {
  readonly count = signal<number | undefined>(5);
  readonly max = signal(99);
  readonly dot = signal(false);
  readonly showZero = signal(false);
  readonly ariaLabel = signal<string | undefined>(undefined);
}

/** Dispatch a `transitionend` for a given CSS property (env-agnostic — no `TransitionEvent`). */
function fireTransitionEnd(el: HTMLElement, propertyName: string): void {
  const ev = new Event("transitionend", { bubbles: true });
  Object.defineProperty(ev, "propertyName", { value: propertyName });
  el.dispatchEvent(ev);
}

describe("BpdmBadge", () => {
  it("applies the variant × appearance tone", () => {
    const fixture = TestBed.createComponent(BadgeHost);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector("span.inline-flex") as HTMLElement;
    expect(badge.className).toContain("bg-success"); // success/solid
    expect(badge.textContent).toContain("Active");
  });

  it("renders a remove button when `removable` is a bare attribute", () => {
    const fixture = TestBed.createComponent(RemovableHost);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button[aria-label="Remove"]');
    expect(btn).toBeTruthy();
  });

  it("gives the remove button a pointer cursor", () => {
    const fixture = TestBed.createComponent(RemovableHost);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector(
      'button[aria-label="Remove"]',
    ) as HTMLButtonElement;
    expect(btn.className).toContain("cursor-pointer");
  });

  it("remove aria-label defaults to Remove and is overridable via [messages]", () => {
    const fixture = TestBed.createComponent(MessagesHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('button[aria-label="Remove"]')).toBeTruthy();

    fixture.componentInstance.messages.set({ remove: "Entfernen" });
    fixture.detectChanges();
    expect(host.querySelector('button[aria-label="Entfernen"]')).toBeTruthy();
    expect(host.querySelector('button[aria-label="Remove"]')).toBeFalsy();
  });

  it("emits removed once the collapse (grid-template-columns) transition ends", () => {
    const fixture = TestBed.createComponent(RemovableHost);
    fixture.detectChanges();
    const instance = fixture.debugElement.query(By.directive(BpdmBadge)).componentInstance as BpdmBadge;
    const spy = vi.fn();
    instance.removed.subscribe(spy);

    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Remove"]',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const badgeEl = fixture.nativeElement.querySelector("bpdm-badge") as HTMLElement;
    fireTransitionEnd(badgeEl, "opacity"); // unrelated property → no emit
    expect(spy).not.toHaveBeenCalled();
    fireTransitionEnd(badgeEl, "grid-template-columns"); // the collapse transition → emit
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe("BpdmNotificationBadge", () => {
  it("caps the count at max with a + suffix", () => {
    const fixture = TestBed.createComponent(NotifHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("99+");
  });

  it("shows the count", () => {
    const fixture = TestBed.createComponent(NotifConfigHost);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector("span.rounded-full") as HTMLElement;
    expect(badge.textContent).toContain("5");
  });

  it("renders a dot with no number", () => {
    const fixture = TestBed.createComponent(NotifConfigHost);
    fixture.componentInstance.dot.set(true);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector("span.rounded-full") as HTMLElement;
    expect(badge).toBeTruthy();
    expect(badge.textContent?.trim()).toBe("");
    expect(badge.className).toContain("size-2.5");
  });

  it("hides at zero unless showZero", () => {
    const fixture = TestBed.createComponent(NotifConfigHost);
    fixture.componentInstance.count.set(0);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("span.rounded-full")).toBeFalsy();

    fixture.componentInstance.showZero.set(true);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector("span.rounded-full") as HTMLElement;
    expect(badge.textContent).toContain("0");
  });

  it("exposes an accessible name via [ariaLabel]", () => {
    const fixture = TestBed.createComponent(NotifConfigHost);
    fixture.componentInstance.ariaLabel.set("5 unread messages");
    fixture.detectChanges();
    const status = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
    expect(status).toBeTruthy();
    expect(status.getAttribute("aria-label")).toBe("5 unread messages");
    expect(status.textContent).toContain("5");
  });

  it("keeps the indicator decorative when no ariaLabel is given", () => {
    const fixture = TestBed.createComponent(NotifConfigHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeFalsy();
  });
});
