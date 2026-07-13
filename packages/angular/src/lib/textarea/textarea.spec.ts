import { ApplicationRef, Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmTextarea } from "./textarea";

@Component({
  imports: [BpdmTextarea],
  template: `<textarea bpdmTextarea size="lg" autoResize></textarea>`,
})
class HostComponent {}

@Component({
  imports: [BpdmTextarea],
  template: `<textarea bpdmTextarea class="custom-x"></textarea>`,
})
class DefaultHost {}

@Component({
  imports: [BpdmTextarea],
  template: `<textarea bpdmTextarea showCount maxlength="120" aria-describedby="hint">hello</textarea>`,
})
class CountHost {}

const macrotask = () => new Promise<void>((r) => setTimeout(r, 0));

describe("BpdmTextarea", () => {
  it("applies the size class and forces resize-none when autoResize is set", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const ta = fixture.nativeElement.querySelector("textarea") as HTMLTextAreaElement;
    expect(ta.classList.contains("min-h-24")).toBe(true); // lg
    expect(ta.classList.contains("resize-none")).toBe(true); // autoResize → none
  });

  it("defaults to md size and vertical resize, and merges user classes", () => {
    const fixture = TestBed.createComponent(DefaultHost);
    fixture.detectChanges();
    const ta = fixture.nativeElement.querySelector("textarea") as HTMLTextAreaElement;
    expect(ta.classList.contains("min-h-20")).toBe(true); // md size
    expect(ta.classList.contains("resize-y")).toBe(true); // vertical resize
    expect(ta.classList.contains("custom-x")).toBe(true); // merged user class
  });

  it("renders a showCount counter linked to the field via aria-describedby", async () => {
    const fixture = TestBed.createComponent(CountHost);
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    await macrotask();
    fixture.detectChanges();

    const ta = fixture.nativeElement.querySelector("textarea") as HTMLTextAreaElement;
    const describedBy = ta.getAttribute("aria-describedby") ?? "";
    // caller-supplied id preserved, counter id appended (mirrors React)
    expect(describedBy.startsWith("hint ")).toBe(true);
    const countId = describedBy.split(" ")[1];
    const counter = fixture.nativeElement.querySelector(`#${countId}`) as HTMLElement;
    expect(counter).toBeTruthy();
    expect(counter.textContent).toBe("5 / 120"); // "hello" = 5, maxlength 120
  });
});
