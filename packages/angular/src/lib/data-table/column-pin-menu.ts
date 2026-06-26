import { ChangeDetectionStrategy, Component, input, output, signal } from "@angular/core";
import { BpdmPopover } from "../popover/popover";

const PIN_ITEM =
  "flex w-full cursor-pointer items-center gap-2 rounded-[calc(var(--radius)-4px)] px-2 py-1.5 text-sm outline-none transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40";

/** Per-column header menu: Pin left / Pin right / Unpin (interactive freezing). */
@Component({
  selector: "bpdm-column-pin-menu",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BpdmPopover],
  host: { class: "contents" },
  template: `
    <button
      type="button"
      aria-label="Column options"
      [bpdmPopover]="panel"
      [(bpdmPopoverOpen)]="open"
      bpdmPopoverAlign="end"
      bpdmPopoverClass="min-w-[9rem] p-1"
      (click)="$event.stopPropagation()"
      class="grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground/70 transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <svg viewBox="0 0 16 16" class="size-4" aria-hidden="true">
        <circle cx="8" cy="3.5" r="1.3" fill="currentColor" />
        <circle cx="8" cy="8" r="1.3" fill="currentColor" />
        <circle cx="8" cy="12.5" r="1.3" fill="currentColor" />
      </svg>
    </button>

    <ng-template #panel>
      <button type="button" [class]="item" [disabled]="pin() === 'left'" (click)="choose('left')">
        <svg viewBox="0 0 16 16" class="size-3.5 text-muted-foreground" fill="none" aria-hidden="true">
          <path d="M10 4 6 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Pin left
      </button>
      <button type="button" [class]="item" [disabled]="pin() === 'right'" (click)="choose('right')">
        <svg viewBox="0 0 16 16" class="size-3.5 text-muted-foreground" fill="none" aria-hidden="true">
          <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Pin right
      </button>
      <button type="button" [class]="item" [disabled]="!pin()" (click)="choose(undefined)">
        <span class="size-3.5"></span>
        Unpin
      </button>
    </ng-template>
  `,
})
export class BpdmColumnPinMenu {
  readonly pin = input<"left" | "right" | undefined>(undefined);
  readonly pinChange = output<"left" | "right" | undefined>();

  protected readonly item = PIN_ITEM;
  protected readonly open = signal(false);

  protected choose(p: "left" | "right" | undefined): void {
    this.pinChange.emit(p);
    this.open.set(false);
  }
}
