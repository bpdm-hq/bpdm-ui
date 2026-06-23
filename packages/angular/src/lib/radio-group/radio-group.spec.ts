import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmRadio, BpdmRadioGroup } from "./radio-group";

@Component({
  imports: [BpdmRadioGroup, BpdmRadio],
  template: `<bpdm-radio-group [value]="'a'">
    <bpdm-radio value="a" />
    <bpdm-radio value="b" />
  </bpdm-radio-group>`,
})
class HostComponent {}

describe("BpdmRadioGroup", () => {
  it("checks the selected item and switches selection on click", () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const radios = fixture.nativeElement.querySelectorAll('[role="radio"]') as NodeListOf<HTMLButtonElement>;
    expect(radios[0].getAttribute("data-state")).toBe("checked");
    expect(radios[1].getAttribute("data-state")).toBe("unchecked");

    radios[1].click();
    fixture.detectChanges();
    expect(radios[0].getAttribute("data-state")).toBe("unchecked");
    expect(radios[1].getAttribute("data-state")).toBe("checked");
  });
});
