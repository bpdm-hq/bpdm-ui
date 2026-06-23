import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmBadge, BpdmNotificationBadge } from "./badge";

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
  imports: [BpdmNotificationBadge],
  template: `<bpdm-notification-badge [count]="128" [max]="99">x</bpdm-notification-badge>`,
})
class NotifHost {}

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
});

describe("BpdmNotificationBadge", () => {
  it("caps the count at max with a + suffix", () => {
    const fixture = TestBed.createComponent(NotifHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("99+");
  });
});
