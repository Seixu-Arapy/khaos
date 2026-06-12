import {
  CheckCircleIcon,
  ClockIcon,
  EllipsisHorizontalCircleIcon,
  EyeIcon,
  FolderOpenIcon,
  MagnifyingGlassCircleIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  QuestionMarkCircleIcon,
  QueueListIcon,
  XCircleIcon
} from "@heroicons/react/24/outline"

import PriorityBadge from "../badges/PriorityBadge"
import SequenceIndicator from "../badges/SequenceIndicator"

// ─────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────

const STATUS_CONFIG = {
  planning: { icon: MagnifyingGlassCircleIcon, style: "text-brand-accent" },
  todo: { icon: PlayCircleIcon, style: "text-app-muted" },
  in_progress: {
    icon: EllipsisHorizontalCircleIcon,
    style: "text-brand-primary animate-pulse"
  },
  in_review: { icon: EyeIcon, style: "text-brand-accent" },
  done: { icon: CheckCircleIcon, style: "text-brand-success" },
  paused: { icon: PauseCircleIcon, style: "text-app-muted" },
  cancelled: { icon: XCircleIcon, style: "text-brand-danger" }
}

// ─────────────────────────────────────────────
// Shared internals
// ─────────────────────────────────────────────

function StatusPill({ id, status }) {
  const config = STATUS_CONFIG[status?.toLowerCase?.().trim()] ?? {
    icon: QuestionMarkCircleIcon,
    style: "text-app-muted"
  }
  const Icon = config.icon

  return (
    <span className="inline-flex items-center gap-1 rounded border border-app-border bg-app-surface px-1 py-0.5 font-mono text-[10px] font-bold text-app-muted">
      <Icon className={`h-3.5 w-3.5 ${config.style}`} />
      {id ?? "??"}
    </span>
  )
}

function DueDate({ due }) {
  if (!due) return null
  const date = new Date(due)
  const isPast = date < new Date()

  const day = date.toLocaleDateString("pt-BR", { day: "2-digit" })
  const month = date
    .toLocaleDateString("pt-BR", { month: "short" })
    .toUpperCase()
    .replace(".", "")

  return (
    <span
      className={`inline-flex items-baseline font-mono text-[10px] ${isPast ? "animate-pulse" : ""}`}
    >
      <span
        className={`font-semibold ${isPast ? "text-brand-danger" : "text-app-text"}`}
      >
        {day}
      </span>
      <span
        className={`font-light ${isPast ? "text-brand-danger/70" : "text-app-muted"}`}
      >
        {month}
      </span>
    </span>
  )
}

function ProjectSection({ projectName, sectionName }) {
  if (!projectName && !sectionName) return null
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-app-muted">
      {projectName && (
        <>
          <FolderOpenIcon className="h-3 w-3" />
          <span>{projectName}</span>
        </>
      )}
      {projectName && sectionName && <span className="text-app-border">/</span>}
      {sectionName && (
        <>
          <QueueListIcon className="h-3 w-3" />
          <span>{sectionName}</span>
        </>
      )}
    </span>
  )
}

// ─────────────────────────────────────────────
// variant="inline"       — pill(status+id) + nome
// variant="inline-extra" — pill(status+id) + nome + prioridade + due
// variant="list"         — item de lista com dependência
// variant="card"         — card completo
// variant="agenda"       — card com horário
// ─────────────────────────────────────────────

export default function Task({
  id,
  name,
  task,
  startAt,
  endAt,
  variant = "inline",
  className = ""
}) {
  const t = task ?? { id, name }

  // ── inline | inline-extra ────────────────────
  if (variant === "inline" || variant === "inline-extra") {
    return (
      <span
        className={`inline-flex flex-wrap items-center gap-1.5 rounded border border-app-card bg-app-bg py-0.5 pr-2 align-top font-serif text-[11px] font-light tracking-wider text-app-text ${className}`}
      >
        <StatusPill id={t.id} status={t.status} />
        <span>{t.name}</span>
        {variant === "inline-extra" && (
          <SequenceIndicator
            previous_task={t.previous_task}
            next_task={t.next_task}
            status={t.status}
          />
        )}
        {variant === "inline-extra" && <DueDate due={t.due} />}
        {variant === "inline-extra" && (
          <PriorityBadge priority={t.priority} showLabel={false} />
        )}
      </span>
    )
  }

  // ── list ────────────────────────────────────
  if (variant === "list") {
    return (
      <div
        className={`flex min-w-0 items-start justify-between gap-3 border-b border-app-border/30 py-1.5 last:border-0 ${className}`}
      >
        <div className="flex min-w-0 items-center gap-1.5">
          <StatusPill id={t.id} status={t.status} />
          <span className="truncate font-serif text-[11px] font-light tracking-wider text-app-text">
            {t.name}
          </span>
          <PriorityBadge priority={t.priority} showLabel={false} />
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <SequenceIndicator
            previous_task={t.previous_task}
            next_task={t.next_task}
            status={t.status}
          />
          <DueDate due={t.due} />
        </div>
      </div>
    )
  }

  // ── card ────────────────────────────────────
  if (variant === "card") {
    return (
      <div
        className={`space-y-2 rounded-xl border border-app-border bg-app-surface/30 p-3 ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-1.5">
            <StatusPill id={t.id} status={t.status} />
            <span className="font-serif text-sm font-light tracking-wide text-app-text">
              {t.name}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
            <SequenceIndicator
              previous_task={t.previous_task}
              next_task={t.next_task}
              status={t.status}
            />
            <PriorityBadge priority={t.priority ?? "none"} showLabel={false} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-app-border/30 pt-0.5">
          <DueDate due={t.due} />
          <ProjectSection
            projectName={t.project_name ?? t.project?.name}
            sectionName={t.section_name ?? t.section?.name}
          />
          <SequenceIndicator
            previous_task={t.previous_task}
            next_task={t.next_task}
            status={t.status}
          />
        </div>
      </div>
    )
  }

  // ── agenda ──────────────────────────────────
  if (variant === "agenda") {
    const fmt = ts =>
      ts
        ? new Date(ts).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
          })
        : null

    const start = fmt(startAt ?? t.start_at)
    const end = fmt(endAt ?? t.end_at)

    return (
      <div
        className={`flex gap-2.5 rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-3 ${className}`}
      >
        {(start || end) && (
          <div className="flex shrink-0 flex-col items-end gap-0.5 pt-0.5 font-mono text-[10px] text-brand-primary/60">
            {start && <span>{start}</span>}
            {end && (
              <>
                <div className="my-0.5 w-px flex-1 border-l border-dashed border-brand-primary/20" />
                <span>{end}</span>
              </>
            )}
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-start gap-1.5">
              <StatusPill id={t.id} status={t.status} />
              <span className="font-serif text-sm font-light tracking-wide text-app-text">
                {t.name}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {t.priority && (
                <PriorityBadge
                  priority={t.priority ?? "none"}
                  showLabel={false}
                />
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {t.estimate && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-app-muted">
                <ClockIcon className="h-3 w-3" />
                {t.estimate >= 60
                  ? `${Math.floor(t.estimate / 60)}h${t.estimate % 60 ? ` ${t.estimate % 60}min` : ""}`
                  : `${t.estimate}min`}
              </span>
            )}
            <ProjectSection
              projectName={t.project_name ?? t.project?.name}
              sectionName={t.section_name ?? t.section?.name}
            />
          </div>
        </div>
      </div>
    )
  }

  return null
}
