import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmButton } from "./button";
import type { ButtonVariants } from "@bpdm/variants";

@Component({
  imports: [BpdmButton],
  template: `<button
    bpdmButton
    [variant]="variant()"
    [appearance]="appearance()"
    [size]="size()"
    [shape]="shape()"
    [type]="type()"
    [loading]="loading()"
    [loadingLabel]="loadingLabel()"
    [class]="extra()"
  >
    Go
  </button>`,
})
class HostComponent {
  readonly variant = signal<NonNullable<ButtonVariants["variant"]>>("primary");
  readonly appearance = signal<NonNullable<ButtonVariants["appearance"]>>("solid");
  readonly size = signal<NonNullable<ButtonVariants["size"]>>("md");
  readonly shape = signal<NonNullable<ButtonVariants["shape"]>>("default");
  readonly type = signal<string | undefined>(undefined);
  readonly loading = signal(false);
  readonly loadingLabel = signal("Loading");
  readonly extra = signal("");
}

@Component({
  imports: [BpdmButton],
  template: `<a bpdmButton href="/x">Link</a>`,
})
class AnchorHost {}

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

  it("applies appearance, size and shape classes", () => {
    const { fixture, button } = setup();
    fixture.componentInstance.appearance.set("outline");
    fixture.componentInstance.size.set("lg");
    fixture.componentInstance.shape.set("round");
    fixture.detectChanges();
    expect(button.classList.contains("border")).toBe(true); // outline
    expect(button.classList.contains("h-12")).toBe(true); // lg
    expect(button.classList.contains("rounded-full")).toBe(true); // round
  });

  it("merges a user class and lets it win via tailwind-merge", () => {
    const { fixture, button } = setup();
    fixture.componentInstance.extra.set("bg-success");
    fixture.detectChanges();
    expect(button.classList.contains("bg-success")).toBe(true);
    expect(button.classList.contains("bg-primary")).toBe(false);
  });

  it("defaults type to button, but respects an explicit type", () => {
    const { fixture, button } = setup();
    expect(button.getAttribute("type")).toBe("button");
    fixture.componentInstance.type.set("submit");
    fixture.detectChanges();
    expect(button.getAttribute("type")).toBe("submit");
  });

  it("works on an anchor host without forcing a type", () => {
    const fixture = TestBed.createComponent(AnchorHost);
    fixture.detectChanges();
    const a = fixture.nativeElement.querySelector("a") as HTMLAnchorElement;
    expect(a.classList.contains("bg-primary")).toBe(true);
    expect(a.getAttribute("type")).toBeNull();
  });

  describe("loading", () => {
    it("injects a labelled spinner and marks the host busy", () => {
      const { fixture, button } = setup();
      fixture.componentInstance.loading.set(true);
      fixture.detectChanges();
      expect(button.getAttribute("aria-busy")).toBe("true");
      expect(button.getAttribute("aria-disabled")).toBe("true");
      expect(button.classList.contains("pointer-events-none")).toBe(true);
      const spinner = button.querySelector("[data-bpdm-spinner]");
      expect(spinner).toBeTruthy();
      expect(spinner!.querySelector("svg")).toBeTruthy();
      expect(spinner!.querySelector(".sr-only")?.textContent).toBe("Loading");
    });

    it("uses a translatable loadingLabel and removes the spinner when done", () => {
      const { fixture, button } = setup();
      fixture.componentInstance.loadingLabel.set("Wird geladen");
      fixture.componentInstance.loading.set(true);
      fixture.detectChanges();
      expect(button.querySelector("[data-bpdm-spinner] .sr-only")?.textContent).toBe("Wird geladen");
      fixture.componentInstance.loading.set(false);
      fixture.detectChanges();
      expect(button.querySelector("[data-bpdm-spinner]")).toBeNull();
      expect(button.getAttribute("aria-busy")).toBeNull();
    });
  });
});
