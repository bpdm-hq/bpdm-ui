import { NgTemplateOutlet } from "@angular/common";
import {
  afterEveryRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  input,
  OnInit,
  Output,
  output,
  signal,
  TemplateRef,
  viewChild,
} from "@angular/core";
import {
  addDays,
  createSchedulerStore,
  eachDayOfInterval,
  endOfMonth,
  InMemoryDataSource,
  isSameDay,
  startOfMonth,
  startOfWeek,
  type CalendarEvent,
  type DataSource,
  type ViewType,
  type WeekStart,
} from "@bpdm/scheduler-core";
import { BpdmSchedulerCreateDialog } from "./create-dialog";
import { BpdmSchedulerDayPeek } from "./day-peek";
import { BpdmSchedulerEventDialog } from "./event-dialog";
import { formatDayLabel, formatMonthLabel, formatRangeLabel } from "./format";
import { defaultMessages, type SchedulerMessages } from "./messages";
import { BpdmSchedulerMonthView } from "./month-view";
import { BpdmSchedulerTimeGrid } from "./time-grid";
import { BpdmSchedulerToolbar } from "./toolbar";
import type { CreateEventInput, CreateFormContext, SlotSelection } from "./types";
import { BpdmSchedulerWeekStrip } from "./week-strip";

/** Generate an id for a created event (interaction-time only — never during SSR). */
function generateId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return "evt-" + Math.random().toString(36).slice(2);
}

type Layout =
  | { kind: "month"; weeks: Date[][]; start: Date; end: Date; label: string }
  | { kind: "grid"; days: Date[]; start: Date; end: Date; label: string };

/**
 * `<bpdm-scheduler>` — a themeable, accessible day/week/month calendar over one framework-agnostic core
 * (`@bpdm/scheduler-core`). The Angular twin of React's `<Scheduler>`: same model, views, options and
 * responsive behaviour. Reads events from a client array (`events`) or a server `dataSource`; supply a
 * `<ng-template #createForm>` to create events. Fully keyboard-operable, i18n via `messages` + `locale`,
 * RTL automatic, and it collapses to a phone layout below `collapseToDayBelow`.
 */
@Component({
  selector: "bpdm-scheduler",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    BpdmSchedulerToolbar,
    BpdmSchedulerTimeGrid,
    BpdmSchedulerMonthView,
    BpdmSchedulerWeekStrip,
    BpdmSchedulerDayPeek,
    BpdmSchedulerEventDialog,
    BpdmSchedulerCreateDialog,
  ],
  host: { "[class]": "rootClass()" },
  template: `
    <div class="bpdm-sch-sr" role="status" aria-live="polite">{{ liveMessage() }}</div>

    <div class="bpdm-sch-viewport" #viewport>
      <bpdm-scheduler-toolbar
        [view]="state().view"
        [label]="toolbarLabel()"
        [views]="views()"
        [messages]="mergedMessages()"
        (today)="onToday()"
        (prev)="onPrev()"
        (next)="onNext()"
        (viewChange)="onViewChange($event)"
      />

      @if (layout().kind === "month") {
        <bpdm-scheduler-month-view
          [weeks]="monthWeeks()"
          [monthDate]="state().date"
          [events]="visibleEvents()"
          [now]="now()"
          [locale]="locale()"
          [monthMaxChips]="monthChips()"
          [createDefaultHour]="createDefaultHour()"
          [createDuration]="createDuration()"
          [editable]="canEdit()"
          [selectable]="slotSelectable()"
          [messages]="mergedMessages()"
          [grabbedId]="grabbedId()"
          (select)="handleSelect($event)"
          (selectSlot)="handleSelectSlot($event)"
          (openDay)="peekDay.set($event)"
          (next)="store.next()"
          (previous)="store.previous()"
          (eventChange)="handleEventChange($event)"
          (grabToggle)="toggleGrab($event)"
          (keepFocus)="keepFocus($event)"
          (announce)="announce($event)"
        />
      } @else {
        @if (compactWeek()) {
          <bpdm-scheduler-week-strip
            [days]="gridDays()"
            [selected]="state().date"
            [now]="now()"
            [events]="visibleEvents()"
            [locale]="locale()"
            [messages]="mergedMessages()"
            (select)="store.setDate($event)"
          />
        }
        <bpdm-scheduler-time-grid
          [days]="timeGridDays()"
          [events]="visibleEvents()"
          [dayStartHour]="dayStartHour()"
          [dayEndHour]="dayEndHour()"
          [scrollToHour]="scrollToHour()"
          [maxHeight]="maxHeight()"
          [hourHeight]="hourHeight()"
          [now]="now()"
          [locale]="locale()"
          [createDuration]="createDuration()"
          [snapMinutes]="snapMinutes()"
          [editable]="canEdit()"
          [selectable]="slotSelectable()"
          [messages]="mergedMessages()"
          [grabbedId]="grabbedId()"
          [hideHeader]="compactWeek()"
          (select)="handleSelect($event)"
          (selectSlot)="handleSelectSlot($event)"
          (eventChange)="handleEventChange($event)"
          (grabToggle)="toggleGrab($event)"
          (keepFocus)="keepFocus($event)"
          (announce)="announce($event)"
        />
      }
    </div>

    @if (peekDay() && !selected()) {
      <bpdm-scheduler-day-peek
        [day]="peekDay()!"
        [events]="peekEvents()"
        [locale]="locale()"
        [messages]="mergedMessages()"
        (select)="handlePeekSelect($event)"
        (close)="peekDay.set(null)"
      />
    }

    @if (selected(); as ev) {
      <bpdm-scheduler-event-dialog
        [event]="ev"
        [locale]="locale()"
        [messages]="mergedMessages()"
        [canBack]="peekDay() !== null"
        (close)="onDialogClose()"
        (back)="selected.set(null)"
      />
    }

    @if (slot() && createFormTpl(); as tpl) {
      <bpdm-scheduler-create-dialog [title]="mergedMessages().createTitle" (cancel)="slot.set(null)">
        <ng-container *ngTemplateOutlet="tpl; context: createContext()" />
      </bpdm-scheduler-create-dialog>
    }
  `,
})
export class BpdmScheduler implements OnInit {
  /** Events for a client-side (in-memory) source. Ignored if `dataSource` is set. */
  readonly events = input<CalendarEvent[]>();
  /** A custom source — e.g. one that fetches a visible range from a server. */
  readonly dataSource = input<DataSource>();
  readonly defaultView = input<ViewType>("week");
  readonly defaultDate = input<Date>();
  /** First hour rendered in day/week (default 0 — the whole day is scrollable). */
  readonly dayStartHour = input(0);
  /** Last hour rendered (default 24). */
  readonly dayEndHour = input(24);
  /** Hour the day/week viewport opens scrolled to (default 7). */
  readonly scrollToHour = input(7);
  /** Max day/week grid viewport height in px before it scrolls (default 600). */
  readonly maxHeight = input(600);
  /** 0 = Sunday … 6 = Saturday (default 1, Monday). */
  readonly weekStartsOn = input<WeekStart>(1);
  /** Which views the toolbar offers (default day + week + month). */
  readonly views = input<ViewType[]>(["day", "week", "month"]);
  /** Reference "now" — injectable for tests/SSR. */
  readonly now = input(new Date());
  readonly locale = input<string>();
  readonly messages = input<Partial<SchedulerMessages>>({});
  /** Default length (minutes) of a slot created by clicking (default 60). */
  readonly createDuration = input(60);
  /** Snap a clicked day/week time to this many minutes (default 30). */
  readonly snapMinutes = input(30);
  /** Month cells have no time axis, so a click there proposes this hour, 0–23 (default 9). */
  readonly createDefaultHour = input(9);
  /** Pixel height of one hour row in day/week (row density; default 52). */
  readonly hourHeight = input(52);
  /** Max event chips per day cell in month view before "+N more" (default 3). */
  readonly monthMaxChips = input(3);
  /** Enable drag-to-move / drag-to-resize. Defaults on when `(eventChange)` is bound. */
  readonly editable = input<boolean>();
  /**
   * Opt-in phone layout: below this width **(the scheduler's own container, not the window)** a week
   * becomes a single day with a week strip, and the month caps its event dots. Unset = off, zero cost.
   */
  readonly collapseToDayBelow = input<number>();
  readonly className = input("", { alias: "class" });

  /** Fires on an event click. Binding it also suppresses the built-in detail dialog (handle it yourself). */
  @Output() readonly eventClick = new EventEmitter<CalendarEvent>();
  /** Persist a moved/resized event. Binding it enables drag-to-move / drag-to-resize. */
  @Output() readonly eventChange = new EventEmitter<CalendarEvent>();
  /** Fires when an empty slot is clicked (its start/end). */
  readonly selectSlot = output<SlotSelection>();
  /** Persist a newly-created event (from the create-form template's `submit`). */
  readonly create = output<CalendarEvent>();

  protected readonly createFormTpl = contentChild<TemplateRef<CreateFormContext>>("createForm");
  private readonly viewport = viewChild<ElementRef<HTMLElement>>("viewport");
  private readonly rootEl = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);

  // --- store (core defaults; consumer defaults are seeded in ngOnInit, once inputs are available) ---
  protected readonly store = createSchedulerStore();
  protected readonly state = signal(this.store.getState());

  // whether the consumer bound the click / change outputs (parity with React's onEventClick/onEventChange)
  private readonly hasEventClick = signal(false);
  private readonly hasEventChange = signal(false);

  protected readonly liveMessage = signal("");
  protected readonly grabbedId = signal<string | null>(null);
  protected readonly selected = signal<CalendarEvent | null>(null);
  protected readonly peekDay = signal<Date | null>(null);
  protected readonly slot = signal<SlotSelection | null>(null);
  private readonly refreshKey = signal(0);
  private pendingRefocus: string | null = null;

  protected readonly rootClass = computed(() => "bpdm-sch" + (this.className() ? " " + this.className() : ""));
  protected readonly mergedMessages = computed<SchedulerMessages>(() => ({ ...defaultMessages, ...this.messages() }));
  protected readonly canEdit = computed(() => this.editable() ?? this.hasEventChange());
  protected readonly slotSelectable = computed(() => this.createFormTpl() != null);

  private readonly source = computed<DataSource>(() => this.dataSource() ?? new InMemoryDataSource(this.events() ?? []));

  protected readonly layout = computed<Layout>(() => {
    const view = this.state().view;
    const date = this.state().date;
    const wso = this.weekStartsOn();
    const locale = this.locale();
    if (view === "month") {
      const gridStart = startOfWeek(startOfMonth(date), wso);
      const gridEnd = addDays(startOfWeek(endOfMonth(date), wso), 6);
      const days = eachDayOfInterval(gridStart, gridEnd);
      const weekCount = Math.round(days.length / 7);
      const weeks = Array.from({ length: weekCount }, (_, w) => days.slice(w * 7, w * 7 + 7));
      return { kind: "month", weeks, start: gridStart, end: addDays(gridEnd, 1), label: formatMonthLabel(date, locale) };
    }
    if (view === "day") {
      return { kind: "grid", days: [date], start: date, end: addDays(date, 1), label: formatDayLabel(date, locale) };
    }
    const start = startOfWeek(date, wso);
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    return { kind: "grid", days, start, end: addDays(start, 7), label: formatRangeLabel(start, addDays(start, 6), locale) };
  });

  protected readonly monthWeeks = computed(() => {
    const l = this.layout();
    return l.kind === "month" ? l.weeks : [];
  });
  protected readonly gridDays = computed(() => {
    const l = this.layout();
    return l.kind === "grid" ? l.days : [];
  });

  // --- events: read a synchronous (in-memory) source during compute; resolve a promise source via effect ---
  private readonly range = computed(() => ({ start: this.layout().start, end: this.layout().end }));
  private readonly syncEvents = computed<CalendarEvent[] | null>(() => {
    this.refreshKey(); // explicit refetch trigger
    const result = this.source().fetch(this.range());
    return Array.isArray(result) ? result : null;
  });
  private readonly asyncEvents = signal<CalendarEvent[]>([]);
  protected readonly visibleEvents = computed(() => this.syncEvents() ?? this.asyncEvents());

  protected readonly peekEvents = computed(() => {
    const pd = this.peekDay();
    if (!pd) return [] as CalendarEvent[];
    return this.visibleEvents()
      .filter((e) => isSameDay(e.start, pd))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  });

  // --- responsive: watch the viewport's OWN width (opt-in via collapseToDayBelow) ---
  private readonly containerWidth = signal<number | null>(null);
  protected readonly phoneMode = computed(() => {
    const t = this.collapseToDayBelow();
    const w = this.containerWidth();
    return !!t && w !== null && w < t;
  });
  protected readonly compactWeek = computed(() => {
    const view = this.state().view;
    return this.phoneMode() && this.views().includes("day") && (view === "week" || view === "workWeek");
  });
  protected readonly monthChips = computed(() => (this.phoneMode() ? Math.min(2, this.monthMaxChips()) : this.monthMaxChips()));

  protected readonly toolbarLabel = computed(() =>
    this.compactWeek() ? formatDayLabel(this.state().date, this.locale()) : this.layout().label,
  );
  protected readonly timeGridDays = computed(() => (this.compactWeek() ? [this.state().date] : this.gridDays()));

  protected readonly createContext = computed<CreateFormContext | null>(() => {
    const s = this.slot();
    if (!s) return null;
    return {
      $implicit: s,
      slot: s,
      submit: (input) => this.submitCreate(input),
      cancel: () => this.slot.set(null),
    };
  });

  constructor() {
    // keep the state signal in sync with the observable store
    this.destroyRef.onDestroy(this.store.subscribe(() => this.state.set(this.store.getState())));

    // resolve a promise-returning (server) source; a synchronous source is read in `syncEvents`
    effect((onCleanup) => {
      if (this.syncEvents()) return;
      const source = this.source();
      const range = this.range();
      this.refreshKey();
      let active = true;
      onCleanup(() => (active = false));
      Promise.resolve(source.fetch(range)).then((result) => {
        if (active) this.asyncEvents.set(result);
      });
    });

    // opt-in responsive: observe the viewport's inline width
    effect((onCleanup) => {
      const threshold = this.collapseToDayBelow();
      const el = this.viewport()?.nativeElement;
      if (!threshold || !el || typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver((entries) => {
        this.containerWidth.set(entries[0]?.contentRect.width ?? el.clientWidth);
      });
      ro.observe(el);
      onCleanup(() => ro.disconnect());
    });

    // Restore focus to an event after a move remounts it (keeps a keyboard grab live). Runs after every
    // render but no-ops unless a move requested it — cheaper + simpler than the React layout-effect, and
    // client-only (afterRender never runs on the server).
    afterEveryRender(() => {
      const id = this.pendingRefocus;
      if (!id) return;
      this.pendingRefocus = null;
      const node = this.rootEl.querySelector<HTMLElement>(`[data-event-id="${CSS.escape(id)}"]`);
      if (node && document.activeElement !== node) node.focus();
    });
  }

  ngOnInit(): void {
    // seed the store with the consumer's initial view/date (inputs are available now, not in the ctor)
    this.store.setView(this.defaultView());
    const d = this.defaultDate();
    if (d) this.store.setDate(d);
    // parity with React: onEventClick present ⇒ suppress the built-in dialog; onEventChange ⇒ editable
    this.hasEventClick.set(this.eventClick.observed);
    this.hasEventChange.set(this.eventChange.observed);
  }

  protected onToday(): void {
    this.store.today();
  }
  protected onPrev(): void {
    if (this.compactWeek()) this.store.setDate(addDays(this.state().date, -1));
    else this.store.previous();
  }
  protected onNext(): void {
    if (this.compactWeek()) this.store.setDate(addDays(this.state().date, 1));
    else this.store.next();
  }
  protected onViewChange(v: ViewType): void {
    this.store.setView(v);
  }

  protected announce(message: string): void {
    this.liveMessage.set(message);
  }
  protected toggleGrab(id: string): void {
    this.grabbedId.update((prev) => (prev === id ? null : id));
  }
  protected keepFocus(id: string): void {
    this.pendingRefocus = id;
  }

  protected handleSelect(event: CalendarEvent): void {
    if (this.hasEventClick()) this.eventClick.emit(event);
    else this.selected.set(event);
  }

  protected handlePeekSelect(event: CalendarEvent): void {
    if (this.hasEventClick()) {
      this.eventClick.emit(event);
      this.peekDay.set(null);
    } else {
      this.selected.set(event); // keep peekDay so the dialog can go back to the list
    }
  }

  protected onDialogClose(): void {
    this.selected.set(null);
    this.peekDay.set(null);
  }

  protected handleSelectSlot(picked: SlotSelection): void {
    this.selectSlot.emit(picked);
    if (this.createFormTpl()) this.slot.set(picked);
  }

  private submitCreate(inp: CreateEventInput): void {
    const s = this.slot();
    const event: CalendarEvent = {
      id: inp.id ?? generateId(),
      title: inp.title,
      start: inp.start ?? (s ? s.start : new Date()),
      end: inp.end ?? (s ? s.end : new Date()),
      ...(inp.category !== undefined ? { category: inp.category } : {}),
      ...(inp.location !== undefined ? { location: inp.location } : {}),
      ...(inp.description !== undefined ? { description: inp.description } : {}),
      ...(inp.data !== undefined ? { data: inp.data } : {}),
    };
    this.slot.set(null);
    this.create.emit(event);
    // refetch so a server-backed source shows the new event (a client source already re-renders)
    this.refreshKey.update((k) => k + 1);
  }

  protected handleEventChange(changed: CalendarEvent): void {
    this.eventChange.emit(changed);
    // only a server-backed source needs a refetch; an in-memory source already re-renders via `events`
    if (this.dataSource()) this.refreshKey.update((k) => k + 1);
  }
}
