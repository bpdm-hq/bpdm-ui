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
  imports: [BpdmAvatar],
  template: `<bpdm-avatar name="Aria Lindqvist" status="online" [messages]="{ online: 'En línea' }" />`,
})
class LocalizedAvatarHost {}

@Component({
  imports: [BpdmAvatarGroup],
  template: `<bpdm-avatar-group [users]="users" [max]="2" />`,
})
class GroupHost {
  readonly users: AvatarGroupUser[] = [{ name: "A B" }, { name: "C D" }, { name: "E F" }, { name: "G H" }];
}

@Component({
  imports: [BpdmAvatarGroup],
  template: `<bpdm-avatar-group [users]="users" [max]="1" [messages]="{ more: '+{count} personas', online: 'En línea' }" />`,
})
class LocalizedGroupHost {
  readonly users: AvatarGroupUser[] = [
    { name: "A B", status: "online" },
    { name: "C D", status: "online" },
    { name: "E F", status: "online" },
  ];
}

describe("BpdmAvatar", () => {
  it("shows auto-tinted initials and a presence dot", () => {
    const fixture = TestBed.createComponent(AvatarHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain("AL"); // initials of "Aria Lindqvist"
    const dot = host.querySelector('[aria-label="Online"]') as HTMLElement;
    expect(dot).toBeTruthy();
    expect(dot.getAttribute("role")).toBe("img");
    expect(dot.className).toContain("bg-success");
  });

  it("names the fallback with the full name for screen readers", () => {
    const fixture = TestBed.createComponent(AvatarHost);
    fixture.detectChanges();
    const named = fixture.nativeElement.querySelector('[aria-label="Aria Lindqvist"]') as HTMLElement;
    expect(named).toBeTruthy();
    expect(named.getAttribute("role")).toBe("img");
  });

  it("localizes the status dot label via messages", () => {
    const fixture = TestBed.createComponent(LocalizedAvatarHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('[aria-label="En línea"]')).toBeTruthy();
    expect(host.querySelector('[aria-label="Online"]')).toBeNull();
  });

  it("falls back to a person icon with no name/src", () => {
    const fixture = TestBed.createComponent(IconHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("svg")).toBeTruthy();
  });
});

describe("BpdmAvatarGroup", () => {
  it("shows up to `max` avatars and a +N overflow tile with a localized label", () => {
    const fixture = TestBed.createComponent(GroupHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll("bpdm-avatar").length).toBe(2);
    expect(host.textContent).toContain("+2"); // 4 users − 2 shown
    const tile = host.querySelector('[aria-label="2 more"]') as HTMLElement;
    expect(tile).toBeTruthy();
    expect(tile.getAttribute("role")).toBe("img");
  });

  it("localizes the overflow label and forwards messages to child status dots", () => {
    const fixture = TestBed.createComponent(LocalizedGroupHost);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    // 3 users − 1 shown → "+2 personas"
    expect(host.querySelector('[aria-label="+2 personas"]')).toBeTruthy();
    // the single shown avatar's status dot picks up the group's localized label
    expect(host.querySelector('bpdm-avatar [aria-label="En línea"]')).toBeTruthy();
  });
});
