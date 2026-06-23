import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmInput } from "./input";

@Component({
  imports: [BpdmInput],
  template: `<input bpdmInput variant="underline" size="lg" class="pl-9" />`,
})
class HostComponent {}

describe("BpdmInput", () => {
  it("applies the variant + size classes and merges user classes", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector("input") as HTMLInputElement;
    expect(input.classList.contains("border-b")).toBe(true); // underline variant
    expect(input.classList.contains("h-12")).toBe(true); // lg size
    expect(input.classList.contains("pl-9")).toBe(true); // merged user class
    expect(input.classList.contains("border")).toBe(false); // not the outline box border
  });
});
