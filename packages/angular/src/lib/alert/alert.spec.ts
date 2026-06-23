import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmAlert } from "./alert";

@Component({
  imports: [BpdmAlert],
  template: `<bpdm-alert variant="error" title="Oops">Something failed</bpdm-alert>`,
})
class HostComponent {}

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
});
