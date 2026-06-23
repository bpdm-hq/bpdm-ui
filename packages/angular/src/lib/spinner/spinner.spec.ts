import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmSpinner } from "./spinner";

@Component({
  imports: [BpdmSpinner],
  template: `<bpdm-spinner variant="dots" label="Please wait" class="text-success" />`,
})
class HostComponent {}

describe("BpdmSpinner", () => {
  it("renders an accessible spinner with a visually-hidden label and merged color", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector("bpdm-spinner") as HTMLElement;

    expect(host.getAttribute("role")).toBe("status");
    expect(host.classList.contains("text-success")).toBe(true); // user color
    expect(host.classList.contains("text-primary")).toBe(false); // tailwind-merge dropped default
    expect(host.querySelector(".sr-only")?.textContent).toContain("Please wait");
    // dots variant renders three staggered dots (each with an animation-delay)
    expect(host.querySelectorAll('span[style*="animation-delay"]').length).toBe(3);
  });
});
