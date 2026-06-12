import {
  CalendarDaysIcon,
  Square3Stack3DIcon
} from "@heroicons/react/24/outline"

import { FIELDS_CONFIG } from "../../config/fields.config"
import PriorityBadge from "../badges/PriorityBadge"
import StatusBadge from "../badges/StatusBadge"
import Task from "./Task"

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getFieldConfig(fieldName) {
  return FIELDS_CONFIG[fieldName] ?? null
}

function FieldIcon({ fieldName, className = "" }) {
  const config = getFieldConfig(fieldName)
  if (!config)
    return (
      <Square3Stack3DIcon
        className={`h-3.5 w-3.5 stroke-1 text-app-muted ${className}`}
      />
    )
  const Icon = config.icon
  return (
    <Icon
      className={`h-3.5 w-3.5 stroke-1 ${config.classes.text} ${className}`}
    />
  )
}

function DueDate({ due }) {
  if (!due) return null
  const date = new Date(due)
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit" })
  const month = date
    .toLocaleDateString("pt-BR", { month: "short" })
    .toUpperCase()
    .replace(".", "")
  const isPast = date < new Date()

  return (
    <span
      className={`inline-flex items-baseline gap-0.5 font-mono text-[10px] ${isPast ? "text-brand-danger" : "text-app-muted"}`}
    >
      <CalendarDaysIcon className="h-3 w-3 self-center" />
      <span className="font-semibold">{day}</span>
      <span className="font-light">{month}</span>
    </span>
  )
}

// ─────────────────────────────────────────────
// variant="inline"       — ID (+ ícone se showIcon)
// variant="inline-extra" — inline + status + prioridade + due
// variant="card"         — inline-extra + nome do projeto
// variant="list"         — summary/details com tarefas
// ─────────────────────────────────────────────

export default function Section({
  id,
  name,
  section,
  showIcon = false,
  variant = "inline",
  className = ""
}) {
  const s = section ?? { id, name }
  const fieldName = s.field?.name ?? s.field_name ?? s.projects?.fields?.name

  // ── inline ──────────────────────────────────
  if (variant === "inline") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 align-middle font-mono text-[11px] font-light tracking-wide text-app-text ${className}`}
      >
        <span className="inline-flex gap-1 rounded border border-app-border bg-app-bg px-1 py-0.5 align-middle font-mono text-[10px] font-bold text-app-muted">
          {showIcon && <FieldIcon fieldName={fieldName} />}
          {s.id ?? "??"}
        </span>
        {s.name ?? ""}
      </span>
    )
  }

  // ── inline-extra ─────────────────────────────
  if (variant === "inline-extra") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded border border-app-border bg-app-surface/30 py-0.5 pr-2 align-middle font-mono text-[11px] font-light tracking-wide text-app-text ${className}`}
      >
        <span className="inline-flex gap-1 rounded border border-app-border bg-app-bg px-1 py-0.5 font-mono text-[10px] font-bold text-app-muted">
          {showIcon && <FieldIcon fieldName={fieldName} />}
          {s.id ?? "??"}
        </span>
        <span className="font-serif font-light tracking-wider">{s.name}</span>
        {s.status && <StatusBadge status={s.status} showLabel={false} />}
        {s.priority && (
          <PriorityBadge priority={s.priority} showLabel={false} />
        )}
        <DueDate due={s.due} />
      </span>
    )
  }

  // ── card ─────────────────────────────────────
  if (variant === "card") {
    return (
      <div
        className={`space-y-2 rounded-xl border border-app-border bg-app-surface/30 p-3 ${className}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex gap-1 rounded border border-app-border bg-app-bg px-1 py-0.5 font-mono text-[10px] font-bold text-app-muted">
              {showIcon && <FieldIcon fieldName={fieldName} />}
              {s.id ?? "??"}
            </span>
            <span className="font-serif text-sm font-light tracking-wide text-app-text">
              {s.name}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {s.status && <StatusBadge status={s.status} showLabel={false} />}
            {s.priority && (
              <PriorityBadge priority={s.priority} showLabel={false} />
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-app-border/30 pt-1.5">
          <DueDate due={s.due} />
          {s.project_name && (
            <span className="font-mono text-[10px] text-app-muted">
              {s.project_name}
            </span>
          )}
        </div>
      </div>
    )
  }

  // ── list ─────────────────────────────────────
  if (variant === "list") {
    return (
      <details
        open
        className={`group rounded-xl border border-app-border bg-app-surface/20 p-3 [&_summary::-webkit-details-marker]:hidden ${className}`}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 pb-1.5 select-none">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="mr-1 w-3 shrink-0 text-[9px] text-app-muted transition-transform duration-200 group-open:rotate-90">
              ▶
            </span>
            <span className="inline-flex gap-1 rounded border border-app-border bg-app-bg px-1 py-0.5 font-mono text-[10px] font-bold text-app-muted">
              {showIcon && <FieldIcon fieldName={fieldName} />}
              {s.id ?? "??"}
            </span>
            <span className="truncate font-serif text-xs font-bold text-gray-300 group-open:text-brand-primary">
              {s.name}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {s.status && <StatusBadge status={s.status} />}
            {s.priority && <PriorityBadge priority={s.priority} />}
          </div>
        </summary>

        <ul className="relative mt-1.5 space-y-0.5 border-t border-app-border/40 pt-2 pl-1">
          {s.tasks?.length > 0 ? (
            s.tasks.map(task => (
              <li key={task.id}>
                <Task task={task} variant="list" />
              </li>
            ))
          ) : (
            <li className="py-2 pl-2 text-[11px] text-app-muted italic">
              Nenhuma tarefa aqui
            </li>
          )}
        </ul>
      </details>
    )
  }

  return null
}
