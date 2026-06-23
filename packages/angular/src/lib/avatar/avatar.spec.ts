import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { BpdmAvatar, BpdmAvatarGroup, type AvatarGroupUser } from "./avatar";

@Component({
  imports: [BpdmAvatar],
  template: `<bpdm-avatar name="Aria Lindqvist" status="online" />`,
})
class AvatarHost {}

@Component({
  imports: [BpdmAvatar],
  template: `<bpdm-avatar />`,
})
class IconHost {}

@Component({
  imports: [BpdmAvatarGroup],
  template: `<bpdm-avatar-group [users]="users" [max]="2" />`,
})
class GroupHost {
  readonly users: AvatarGroupUser[] = [{ name: "A B" }, { name: "C D" }, { name: "E F" }, { name: "G H" }];
}

describe("BpdmAvatar", () => {
  it("shows auto-tinted initials and a presence dot", () => {
    const fixture = TestBed.createComponent(AvatarHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain("AL"); // initials of "Aria Lindqvist"
    const dot = host.querySelector('[aria-label="online"]') as HTMLElement;
    expect(dot.className).toContain("bg-success");
  });

  it("falls back to a person icon with no name/src", () => {
    const fixture = TestBed.createComponent(IconHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("svg")).toBeTruthy();
  });
});

describe("BpdmAvatarGroup", () => {
  it("shows up to `max` avatars and a +N overflow tile", () => {
    const fixture = TestBed.createComponent(GroupHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll("bpdm-avatar").length).toBe(2);
    expect(host.textContent).toContain("+2"); // 4 users − 2 shown
  });
});
