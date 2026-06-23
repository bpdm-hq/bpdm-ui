import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmCard, BpdmCardFooter } from "./card";

@Component({
  imports: [BpdmCard],
  template: `<bpdm-card variant="outlined">body</bpdm-card>`,
})
class CardHost {}

@Component({
  imports: [BpdmCard],
  template: `<bpdm-card hoverable>body</bpdm-card>`,
})
class HoverableHost {}

@Component({
  imports: [BpdmCardFooter],
  template: `<div bpdmCardFooter [divider]="divider()">footer</div>`,
})
class FooterHost {
  readonly divider = signal(false);
}

describe("BpdmCard", () => {
  it("applies the requested surface variant", () => {
    const fixture = TestBed.createComponent(CardHost);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector("bpdm-card") as HTMLElement;
    expect(card.classList.contains("border-border")).toBe(true); // outlined
    expect(card.classList.contains("rounded-2xl")).toBe(true); // shared base
  });

  it("applies the hover-lift when `hoverable` is set as a bare attribute", () => {
    const fixture = TestBed.createComponent(HoverableHost);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector("bpdm-card") as HTMLElement;
    expect(card.classList.contains("hover:-translate-y-1.5")).toBe(true); // booleanAttribute → true
  });

  it("toggles the footer divider hairline", () => {
    const fixture = TestBed.createComponent(FooterHost);
    fixture.detectChanges();
    const footer = fixture.nativeElement.querySelector("[bpdmCardFooter]") as HTMLElement;
    expect(footer.classList.contains("border-t")).toBe(false);

    fixture.componentInstance.divider.set(true);
    fixture.detectChanges();
    expect(footer.classList.contains("border-t")).toBe(true);
  });
});
