import { useEffect, useState } from "react"

const HOUR_HEIGHT_PX = 60
const HOURS_GRID = Array.from({ length: 24 }, (_, i) => i)

function toMinutes(isoString) {
  if (!isoString) return 0
  const timePart = isoString.split("T")[1]
  if (!timePart) return 0
  const [hours, minutes] = timePart.split(":").map(Number)
  return hours * 60 + minutes
}

function formatTime(isoString) {
  if (!isoString) return "--:--"
  const timePart = isoString.split("T")[1]
  if (!timePart) return "--:--"
  return timePart.substring(0, 5)
}

function resolveColumns(events) {
  const columns = []

  events.forEach(event => {
    let placed = false

    for (let i = 0; i < columns.length; i++) {
      if (columns[i] <= event.startMin) {
        columns[i] = event.endMin
        event.columnIndex = i
        placed = true
        break
      }
    }

    if (!placed) {
      columns.push(event.endMin)
      event.columnIndex = columns.length - 1
    }
  })

  const totalColumns = columns.length

  events.forEach(event => {
    event.widthPct = 100 / totalColumns
    event.leftPct = event.columnIndex * event.widthPct
  })

  return events
}

function normalizeEvents(eventsData) {
  const normalized = (eventsData ?? []).map(evt => ({
    id: `event-${evt.id}`,
    time: evt.start_at,
    endTime: evt.end_at,
    title: evt.title,
    type: evt.type,
    projectId: evt.project_id,
    projectName: evt.projects?.name,
    startMin: toMinutes(evt.start_at),
    endMin: toMinutes(evt.end_at),
    widthPct: 100,
    leftPct: 0
  }))

  normalized.sort(
    (a, b) =>
      a.startMin - b.startMin || b.endMin - b.startMin - (a.endMin - a.startMin)
  )

  return resolveColumns(normalized)
}

export default function TodayTab({ refreshTrigger }) {
  const [timelineItems, setTimelineItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchDailyData() {
      try {
        const today = new Date().toISOString().split("T")[0]
        const response = await fetch(
          `http://127.0.0.1:8000/events?date=${today}`,
          { signal: controller.signal }
        )

        const eventsData = response.ok ? await response.json() : []
        setTimelineItems(normalizeEvents(eventsData))
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Erro ao carregar blocos da agenda:", error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchDailyData()
    return () => controller.abort()
  }, [refreshTrigger])

  if (isLoading) {
    return (
      <div className="py-4 font-sans text-xs text-app-muted italic">
        Carregando grelha horária...
      </div>
    )
  }

  return (
    <div className="h-full w-full pt-2 font-sans select-none">
      <div className="relative h-full w-full scrollbar-none overflow-y-auto rounded-xl border border-app-border bg-app-surface/20 p-2">
        <div className="relative h-360 w-full">
          {HOURS_GRID.map(hour => (
            <div
              key={hour}
              className="absolute left-0 flex w-full items-start border-t border-app-border/40"
              style={{
                top: `${hour * HOUR_HEIGHT_PX}px`,
                height: `${HOUR_HEIGHT_PX}px`
              }}
            >
              <span className="-mt-2 block w-10 bg-app-bg pr-1 font-mono text-[9px] text-app-muted">
                {String(hour).padStart(2, "0")}:00
              </span>
              <div className="h-px flex-1 bg-app-border/10" />
            </div>
          ))}

          {timelineItems.map(item => {
            const isFixed = item.type === "fixed"
            const durationMin = item.endMin - item.startMin

            return (
              <div
                key={item.id}
                className={`group absolute flex flex-col justify-between overflow-hidden rounded-lg border px-2 py-1.5 shadow-sm transition-all ${
                  isFixed
                    ? "border-brand-accent/30 bg-brand-accent/5 text-brand-accent hover:border-brand-accent/50 hover:bg-brand-accent/10"
                    : "border-brand-primary/30 bg-brand-primary/5 text-brand-primary hover:border-brand-primary/50 hover:bg-brand-primary/10"
                }`}
                style={{
                  top: `${item.startMin}px`,
                  height: `${durationMin}px`,
                  minHeight: "35px",
                  left: `calc(3rem + ${item.leftPct}%)`,
                  width: `calc(${item.widthPct}% - 4px)`
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between gap-1">
                    <span className="font-mono text-[8px] font-bold tracking-wider uppercase opacity-60">
                      {isFixed ? "🔒 FIXO" : "🎯 PLAN"}
                    </span>
                    <span className="font-mono text-[8px] opacity-50">
                      {formatTime(item.time)}
                    </span>
                  </div>
                  <p className="truncate text-[11px] leading-tight font-semibold text-gray-200 transition-colors group-hover:overflow-visible group-hover:whitespace-normal">
                    {item.title}
                  </p>
                </div>

                {item.projectName && durationMin > 45 && (
                  <div className="mt-1 shrink-0 origin-left scale-75 opacity-90"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
