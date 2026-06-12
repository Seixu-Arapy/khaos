import {
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon
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

function FieldIcon({ fieldName, className = "" }) {
  const config = getFieldConfig(fieldName)
  if (!config) return null
  const Icon = config.icon
  return (
    <Icon
      className={`h-3.5 w-3.5 stroke-1 ${config.classes.text} ${className}`}
    />
  )
}

function ProjectName({ name, fieldName }) {
  const config = getFieldConfig(fieldName)
  const colorClass = config?.classes.text ?? "text-app-text"
  return (
    <span
      className={`font-serif text-base font-extralight tracking-wider ${colorClass}`}
    >
      {name}
    </span>
  )
}

function SectionRow({ section }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <span className="truncate font-serif text-[11px] font-light tracking-wide text-app-text">
        {section.name}
      </span>
      <StatusBadge status={section.status} showLabel={false} />
    </div>
  )
}

// ─────────────────────────────────────────────
// variant="inline"       — ícone field + ID + nome na cor do field
// variant="inline-extra" — inline + status + prioridade + due
// variant="card"         — snapshot completo
// variant="list"         — card + seções expansíveis com tarefas
// ─────────────────────────────────────────────

export default function Project({
  id,
  name,
  project,
  variant = "inline",
  className = ""
}) {
  const p = project ?? { id, name }
  const fieldName = p.fields?.name ?? p.field_name

  // ── inline | inline-extra ──────────────────────────────────
  if (variant === "inline" || variant === "inline-extra") {
    return (
      <span
        className={`inline-flex items-center overflow-hidden rounded border border-app-border bg-app-surface/50 align-middle ${className}`}
      >
        <span className="inline-flex items-center gap-1 border-r border-app-border bg-app-bg px-1.5 py-0.5 font-mono text-[10px] font-bold text-app-muted">
          <FieldIcon fieldName={fieldName} />
          {p.id ?? "??"}
        </span>
        <span className="px-2">
          <ProjectName name={p.name} fieldName={fieldName} />
          {variant === "inline-extra" && p.status && (
            <StatusBadge status={p.status} showLabel={false} />
          )}
          {variant === "inline-extra" && (
            <PriorityBadge priority={p.priority} showLabel={false} />
          )}
          <DueDate due={p.due} />
        </span>
      </span>
    )
  }

  // ── card ─────────────────────────────────────
  if (variant === "card") {
    return (
      <div
        className={`space-y-3 rounded-xl border border-app-border bg-app-surface/30 p-4 ${className}`}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded border border-app-border bg-app-bg px-1.5 py-0.5 font-mono text-[10px] font-bold text-app-muted">
              <FieldIcon fieldName={fieldName} />
              {p.id ?? "??"}
            </span>
            <ProjectName name={p.name} fieldName={fieldName} />
          </div>
          {p.doc_reference && (
            <a
              href={p.doc_reference}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-app-muted transition-colors hover:text-app-text"
              title="Documentação"
            >
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {/* meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-app-border/30 pt-2">
          {p.status && <StatusBadge status={p.status} />}
          {p.priority && (
            <PriorityBadge priority={p.priority} showLabel={false} />
          )}
          <DueDate due={p.due} />
        </div>

        {/* sections */}
        {p.sections?.length > 0 && (
          <div className="space-y-0.5 border-t border-app-border/30 pt-2">
            {p.sections.map(s => (
              <SectionRow key={s.id} section={s} />
            ))}
          </div>
        )}

        {/* featured tasks */}
        {p.featured_tasks?.length > 0 && (
          <div className="space-y-1 border-t border-app-border/30 pt-2">
            <span className="font-mono text-[10px] tracking-widest text-app-muted uppercase">
              Em destaque
            </span>
            {p.featured_tasks.map(t => (
              <Task key={t.id} task={t} variant="list" />
            ))}
          </div>
        )}
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
          <div className="flex items-center gap-2">
            <span className="mr-1 w-3 shrink-0 text-[9px] text-app-muted transition-transform duration-200 group-open:rotate-90">
              ▶
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-app-border bg-app-bg px-1 py-0.5 font-mono text-[10px] font-bold text-app-muted">
              <FieldIcon fieldName={fieldName} />
              {p.id ?? "??"}
            </span>
            <ProjectName name={p.name} fieldName={fieldName} />
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {p.status && <StatusBadge status={p.status} />}
            {p.priority && (
              <PriorityBadge priority={p.priority} showLabel={false} />
            )}
          </div>
        </summary>

        <div className="mt-2 space-y-1 border-t border-app-border/40 pt-2">
          {p.sections?.length > 0 ? (
            p.sections.map(s => <SectionRow key={s.id} section={s} />)
          ) : (
            <p className="py-1 text-[11px] text-app-muted italic">
              Nenhuma seção cadastrada
            </p>
          )}
        </div>
      </details>
    )
  }

  return null
}
