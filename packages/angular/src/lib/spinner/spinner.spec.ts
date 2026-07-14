import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { SpinnerVariant } from "@bpdm/variants";
import { BpdmSpinner, BpdmLoadingOverlay, type SpinnerMessages } from "./spinner";

@Component({
  imports: [BpdmSpinner],
  template: `<bpdm-spinner variant="dots" label="Please wait" class="text-success" />`,
})
class HostComponent {}

@Component({
  imports: [BpdmSpinner],
  template: `<bpdm-spinner
    [variant]="variant()"
    [label]="label()"
    [messages]="messages()"
  />`,
})
class SpinnerI18nHost {
  readonly variant = signal<SpinnerVariant>("ring");
  readonly label = signal<string | undefined>(undefined);
  readonly messages = signal<Partial<SpinnerMessages>>({});
}

@Component({
  imports: [BpdmLoadingOverlay],
  template: `<bpdm-loading-overlay
    [show]="show()"
    [label]="label()"
    [messages]="messages()"
  />`,
})
class OverlayHost {
  readonly show = signal(true);
  readonly label = signal<string | undefined>(undefined);
  readonly messages = signal<Partial<SpinnerMessages>>({});
}

describe("BpdmSpinner", () => {
  it("renders an accessible spinner with a visually-hidden label and merged color", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector("bpdm-spinner") as HTMLElement;

    expect(host.getAttribute("role")).toBe("status");
    expect(host.getAttribute("aria-live")).toBe("polite");
    expect(host.classList.contains("text-success")).toBe(true); // user color
    expect(host.classList.contains("text-primary")).toBe(false); // tailwind-merge dropped default
    expect(host.querySelector(".sr-only")?.textContent).toContain("Please wait");
    // dots variant renders three staggered dots (each with an animation-delay)
    expect(host.querySelectorAll('span[style*="animation-delay"]').length).toBe(3);
  });

  it("marks the decorative shape as aria-hidden", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector("bpdm-spinner") as HTMLElement;
    expect(host.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it("sr-only label defaults to Loading, respects messages, and label wins over messages", () => {
    const fixture = TestBed.createComponent(SpinnerI18nHost);
    fixture.detectChanges();
    const sr = () =>
      (fixture.nativeElement.querySelector(".sr-only") as HTMLElement).textContent?.trim();

    // default
    expect(sr()).toBe("Loading");

    // messages override
    fixture.componentInstance.messages.set({ loading: "Wird geladen" });
    fixture.detectChanges();
    expect(sr()).toBe("Wird geladen");

    // per-instance label wins over messages
    fixture.componentInstance.label.set("Please wait");
    fixture.detectChanges();
    expect(sr()).toBe("Please wait");
  });

  it("drops its live region and sr-only label when announce is false", () => {
    TestBed.overrideComponent(SpinnerI18nHost, {
      set: {
        imports: [BpdmSpinner],
        template: `<bpdm-spinner [announce]="false" />`,
      },
    });
    const fixture = TestBed.createComponent(SpinnerI18nHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector("bpdm-spinner") as HTMLElement;
    expect(host.getAttribute("role")).toBeNull();
    expect(host.getAttribute("aria-live")).toBeNull();
    expect(host.querySelector(".sr-only")).toBeFalsy();
  });

  it("renders each variant's shape", () => {
    const fixture = TestBed.createComponent(SpinnerI18nHost);

    fixture.componentInstance.variant.set("ring");
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".border-t-current")).toBeTruthy();

    fixture.componentInstance.variant.set("bars");
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelectorAll('span[style*="animation-delay"]').length,
    ).toBe(4);
  });
});

describe("BpdmLoadingOverlay", () => {
  it("exposes a busy polite status region and hides when show is false", () => {
    const fixture = TestBed.createComponent(OverlayHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector("bpdm-loading-overlay") as HTMLElement;

    expect(host.getAttribute("role")).toBe("status");
    expect(host.getAttribute("aria-live")).toBe("polite");
    expect(host.getAttribute("aria-busy")).toBe("true");
    expect(host.classList.contains("hidden")).toBe(false);
    // the overlay is the single live region — the inner spinner drops its own
    // role=status so screen readers announce once, not twice.
    const spinner = host.querySelector("bpdm-spinner") as HTMLElement;
    expect(spinner.getAttribute("role")).toBeNull();

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();
    expect(host.classList.contains("hidden")).toBe(true);
  });

  it("shows a visible message only when a label is set", () => {
    const fixture = TestBed.createComponent(OverlayHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector("bpdm-loading-overlay") as HTMLElement;
    expect(host.querySelector("p")).toBeFalsy();

    fixture.componentInstance.label.set("Saving");
    fixture.detectChanges();
    expect(host.querySelector("p")?.textContent).toContain("Saving");
  });

  it("announces via an sr-only fallback from messages when no label is given; the visible label wins", () => {
    const fixture = TestBed.createComponent(OverlayHost);
    fixture.componentInstance.messages.set({ loading: "Cargando" });
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector("bpdm-loading-overlay") as HTMLElement;

    // no visible label → the overlay's own sr-only fallback carries the announcement
    expect(host.querySelector(".sr-only")?.textContent?.trim()).toBe("Cargando");
    expect(host.querySelector("p")).toBeFalsy();

    // a visible label replaces the fallback (single announced text, no duplicate)
    fixture.componentInstance.label.set("Saving");
    fixture.detectChanges();
    expect(host.querySelector("p")?.textContent).toContain("Saving");
    expect(host.querySelector(".sr-only")).toBeFalsy();
  });
});
