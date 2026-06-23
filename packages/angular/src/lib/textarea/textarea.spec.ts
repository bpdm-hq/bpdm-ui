import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmTextarea } from "./textarea";

@Component({
  imports: [BpdmTextarea],
  template: `<textarea bpdmTextarea size="lg" autoResize></textarea>`,
})
class HostComponent {}

describe("BpdmTextarea", () => {
  it("applies the size class and forces resize-none when autoResize is set", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const ta = fixture.nativeElement.querySelector("textarea") as HTMLTextAreaElement;
    expect(ta.classList.contains("min-h-24")).toBe(true); // lg
    expect(ta.classList.contains("resize-none")).toBe(true); // autoResize → none
  });
});
