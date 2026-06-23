import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmAlert } from "./alert";

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

describe("BpdmAlert", () => {
  it("renders a titled, role=alert box with the variant accent", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const box = host.querySelector('[role="alert"]') as HTMLElement;

    expect(box).toBeTruthy();
    expect(box.className).toContain("before:bg-destructive"); // error accent
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
});
