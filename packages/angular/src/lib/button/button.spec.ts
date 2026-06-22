import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmButton } from "./button";

@Component({
  imports: [BpdmButton],
  template: `<button bpdmButton [variant]="variant()" [class]="extra()">Go</button>`,
})
class HostComponent {
  readonly variant = signal<"primary" | "destructive">("primary");
  readonly extra = signal("");
}

describe("BpdmButton", () => {
  function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    return { fixture, button };
  }

  it("applies the shared base and default-variant classes", () => {
    const { button } = setup();
    expect(button.classList.contains("inline-flex")).toBe(true); // shared base
    expect(button.classList.contains("bg-primary")).toBe(true); // default variant
    expect(button.classList.contains("h-10")).toBe(true); // default size (md)
  });

  it("reacts to a variant change", () => {
    const { fixture, button } = setup();
    fixture.componentInstance.variant.set("destructive");
    fixture.detectChanges();
    expect(button.classList.contains("bg-destructive")).toBe(true);
    expect(button.classList.contains("bg-primary")).toBe(false);
  });

  it("merges a user class and lets it win via tailwind-merge", () => {
    const { fixture, button } = setup();
    fixture.componentInstance.extra.set("bg-success");
    fixture.detectChanges();
    // the user's background overrides the variant's — no duplicate bg-* token
    expect(button.classList.contains("bg-success")).toBe(true);
    expect(button.classList.contains("bg-primary")).toBe(false);
  });
});
