import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, format, isToday, startOfWeek } from "date-fns";
import { parseRange } from "../../lib/range";
import { EVENT_TYPE_META } from "../../lib/constants";
import { getTimezone } from "../../lib/timezone";

const HOUR_HEIGHT = 48; // px
const DAY_HEIGHT = HOUR_HEIGHT * 24;

function minutesFromMidnight(date) {
  const tz = getTimezone();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export default function CalendarView({ events, onSlotClick, onEventClick }) {
  const [anchor, setAnchor] = useState(new Date());
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const eventsByDay = useMemo(() => {
    const map = new Map(days.map((d) => [format(d, "yyyy-MM-dd"), []]));
    const tz = getTimezone();
    for (const ev of events) {
      const { start, end } = parseRange(ev.duration);
      if (!start) continue;
      // Bucket by the wall-clock date in the user's timezone
      const key = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(
        start,
      ); // "YYYY-MM-DD"
      if (map.has(key))
        map
          .get(key)
          .push({
            ...ev,
            start,
            end: end || new Date(start.getTime() + 30 * 60000),
          });
    }
    return map;
  }, [events, days]);

  function handleColumnClick(day, e) {
    if (e.target !== e.currentTarget) return; // ignore clicks on event blocks (they stop propagation)
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const hour = Math.max(0, Math.min(23, Math.floor(offsetY / HOUR_HEIGHT)));
    const slotDate = new Date(day);
    slotDate.setHours(hour, 0, 0, 0);
    onSlotClick(slotDate);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={() => setAnchor(addDays(anchor, -7))}
          className="rounded p-1 text-ink-400 hover:bg-ink-800"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => setAnchor(addDays(anchor, 7))}
          className="rounded p-1 text-ink-400 hover:bg-ink-800"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => setAnchor(new Date())}
          className="rounded border border-ink-700 px-2 py-0.5 text-xs text-ink-300 hover:bg-ink-800"
        >
          Today
        </button>
        <span className="ml-2 text-sm text-ink-300">
          {format(weekStart, "MMM d")} –{" "}
          {format(addDays(weekStart, 6), "MMM d, yyyy")}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto rounded-lg border border-ink-700">
        <div className="grid grid-cols-[48px_repeat(7,1fr)] sticky top-0 z-10 border-b border-ink-700 bg-ink-900">
          <div />
          {days.map((d) => (
            <div
              key={d.toISOString()}
              className="border-l border-ink-700 px-1.5 py-2 text-center"
            >
              <p className="text-[11px] uppercase tracking-wide text-ink-500">
                {format(d, "EEE")}
              </p>
              <p
                className={`text-sm font-medium ${isToday(d) ? "text-copper-400" : "text-ink-200"}`}
              >
                {format(d, "d")}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[48px_repeat(7,1fr)]">
          <div style={{ height: DAY_HEIGHT }} className="relative">
            {Array.from({ length: 24 }).map((_, h) => (
              <div
                key={h}
                style={{ top: h * HOUR_HEIGHT }}
                className="absolute right-1.5 -translate-y-2 text-[10px] text-ink-600"
              >
                {h === 0
                  ? ""
                  : `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "a" : "p"}`}
              </div>
            ))}
          </div>
          {days.map((day) => {
            const dayEvents = eventsByDay.get(format(day, "yyyy-MM-dd")) || [];
            return (
              <div
                key={day.toISOString()}
                onClick={(e) => handleColumnClick(day, e)}
                style={{ height: DAY_HEIGHT }}
                className="relative cursor-pointer border-l border-ink-700"
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <div
                    key={h}
                    style={{ top: h * HOUR_HEIGHT }}
                    className="pointer-events-none absolute h-px w-full bg-ink-800"
                  />
                ))}
                {dayEvents.map((ev) => {
                  const top =
                    (minutesFromMidnight(ev.start) / 60) * HOUR_HEIGHT;
                  const height = Math.max(
                    18,
                    ((ev.end - ev.start) / 60000 / 60) * HOUR_HEIGHT,
                  );
                  const meta =
                    EVENT_TYPE_META[ev.event_type] || EVENT_TYPE_META.scheduled;
                  return (
                    <button
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(ev);
                      }}
                      style={{ top, height }}
                      className={`absolute left-1 right-1 overflow-hidden rounded border-l-2 px-1.5 py-0.5 text-left text-[11px] leading-tight ${meta.bg} ${meta.text}`}
                    >
                      <span className="font-medium">{ev.name}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
