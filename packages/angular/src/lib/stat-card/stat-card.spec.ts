import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmStatCard } from "./stat-card";

@Component({
  imports: [BpdmStatCard],
  template: `<bpdm-stat-card label="Active users" value="8,420" [delta]="3.1" deltaLabel="vs last week" />`,
})
class GoodHost {}

@Component({
  imports: [BpdmStatCard],
  template: `<bpdm-stat-card label="Bounce rate" value="2.4%" [delta]="0.6" [positiveIsGood]="false" />`,
})
class ChurnHost {}

@Component({
  imports: [BpdmStatCard],
  template: `<bpdm-stat-card label="Anmeldungen" value="1.294" [delta]="12.5" locale="de-DE" [messages]="{ increased: 'Gestiegen' }" />`,
})
class I18nHost {}

@Component({
  imports: [BpdmStatCard],
  template: `<bpdm-stat-card label="Nutzer" value="8" [loading]="true" [messages]="{ loading: 'wird geladen' }" />`,
})
class LoadingHost {}

describe("BpdmStatCard", () => {
  it("shows label + value and a positive delta in green", () => {
    const fixture = TestBed.createComponent(GoodHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain("Active users");
    expect(host.textContent).toContain("8,420");
    expect(host.textContent).toContain("vs last week");
    const delta = host.querySelector("span.font-medium") as HTMLElement;
    expect(delta.className).toContain("text-success");
  });

  it("colors an increase red when positiveIsGood is false", () => {
    const fixture = TestBed.createComponent(ChurnHost);
    fixture.detectChanges();
    const delta = fixture.nativeElement.querySelector("span.font-medium") as HTMLElement;
    expect(delta.className).toContain("text-destructive");
  });

  it("exposes the card as a labelled group", () => {
    const fixture = TestBed.createComponent(GoodHost);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector("bpdm-stat-card") as HTMLElement;
    expect(card.getAttribute("role")).toBe("group");
    const labelledby = card.getAttribute("aria-labelledby")!;
    expect(labelledby).toBeTruthy();
    expect(card.querySelector("#" + labelledby)?.textContent).toContain("Active users");
  });

  it("gives the delta a screen-reader direction (not colour-only)", () => {
    const fixture = TestBed.createComponent(GoodHost);
    fixture.detectChanges();
    const delta = fixture.nativeElement.querySelector("span.font-medium") as HTMLElement;
    expect(delta.getAttribute("aria-label")).toBe("Increased 3.1%");
  });

  it("translates the SR direction and formats the delta for the locale", () => {
    const fixture = TestBed.createComponent(I18nHost);
    fixture.detectChanges();
    const delta = fixture.nativeElement.querySelector("span.font-medium") as HTMLElement;
    expect(delta.getAttribute("aria-label")).toBe("Gestiegen 12,5%"); // de-DE decimal comma
    expect(delta.textContent).toContain("12,5%");
  });

  it("announces a translated loading label", () => {
    const fixture = TestBed.createComponent(LoadingHost);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector("bpdm-stat-card") as HTMLElement;
    expect(card.getAttribute("aria-busy")).toBe("true");
    expect(card.getAttribute("aria-label")).toBe("Nutzer wird geladen");
  });
});
