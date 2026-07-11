import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmCard, BpdmCardFooter, BpdmCardTitle } from "./card";

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

// bpdmCardTitle is a directive applied to whatever heading element you choose,
// so the document-outline level is yours (the Angular equivalent of React's `as`).
@Component({
  imports: [BpdmCardTitle],
  template: `<h2 bpdmCardTitle>Deployment</h2>`,
})
class TitleHost {}

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

  it("styles the title at the heading level you choose, self-contained (m-0)", () => {
    const fixture = TestBed.createComponent(TitleHost);
    fixture.detectChanges();
    const h = fixture.nativeElement.querySelector("h2") as HTMLElement;
    expect(h).toBeTruthy(); // level is the consumer's (here <h2>) — correct outline
    expect(h.classList.contains("text-lg")).toBe(true);
    expect(h.classList.contains("m-0")).toBe(true); // resets ambient host heading margin
  });

  it("keeps the card free of a host link underline (self-contained)", () => {
    const fixture = TestBed.createComponent(CardHost);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector("bpdm-card") as HTMLElement;
    expect(card.classList.contains("no-underline")).toBe(true);
  });
});
