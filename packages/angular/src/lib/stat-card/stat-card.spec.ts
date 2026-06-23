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
});
