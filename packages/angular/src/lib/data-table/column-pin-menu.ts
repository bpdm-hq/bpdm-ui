import { ChangeDetectionStrategy, Component, input, output, signal } from "@angular/core";
import { BpdmPopover } from "../popover/popover";
import { DEFAULT_DATA_TABLE_MESSAGES, type DataTableMessages } from "./data-table-types";

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
      [attr.aria-label]="messages().columnOptions"
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
      @if (reorderable()) {
        <button type="button" [class]="item" [disabled]="!canMoveLeft()" (click)="doMove(-1)">
          <svg viewBox="0 0 16 16" class="size-3.5 text-muted-foreground rtl:-scale-x-100" fill="none" aria-hidden="true">
            <path d="M10 4 6 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ messages().moveColumnLeft }}
        </button>
        <button type="button" [class]="item" [disabled]="!canMoveRight()" (click)="doMove(1)">
          <svg viewBox="0 0 16 16" class="size-3.5 text-muted-foreground rtl:-scale-x-100" fill="none" aria-hidden="true">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          {{ messages().moveColumnRight }}
        </button>
      }
      @if (showPin()) {
      <button type="button" [class]="item" [disabled]="pin() === 'left'" (click)="choose('left')">
        <svg viewBox="0 0 16 16" class="size-3.5 text-muted-foreground rtl:-scale-x-100" fill="none" aria-hidden="true">
          <path d="M10 4 6 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ messages().pinLeft }}
      </button>
      <button type="button" [class]="item" [disabled]="pin() === 'right'" (click)="choose('right')">
        <svg viewBox="0 0 16 16" class="size-3.5 text-muted-foreground rtl:-scale-x-100" fill="none" aria-hidden="true">
          <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ messages().pinRight }}
      </button>
      <button type="button" [class]="item" [disabled]="!pin()" (click)="choose(undefined)">
        <span class="size-3.5"></span>
        {{ messages().unpin }}
      </button>
      }
    </ng-template>
  `,
})
export class BpdmColumnPinMenu {
  readonly pin = input<"left" | "right" | undefined>(undefined);
  readonly pinChange = output<"left" | "right" | undefined>();
  /** Resolved i18n strings from the parent table. */
  readonly messages = input<DataTableMessages>(DEFAULT_DATA_TABLE_MESSAGES);
  /** Show the pin / unpin items (only when the table is `pinnable`). */
  readonly showPin = input(true);
  /** Show the "Move column left/right" items (only when `reorderableColumns`). */
  readonly reorderable = input(false);
  readonly canMoveLeft = input(false);
  readonly canMoveRight = input(false);
  /** Keyboard column move: -1 = left, 1 = right. */
  readonly move = output<-1 | 1>();

  protected readonly item = PIN_ITEM;
  protected readonly open = signal(false);

  protected choose(p: "left" | "right" | undefined): void {
    this.pinChange.emit(p);
    this.open.set(false);
  }
  protected doMove(dir: -1 | 1): void {
    this.move.emit(dir);
    this.open.set(false);
  }
}
