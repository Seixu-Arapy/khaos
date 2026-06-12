import {
  CheckCircleIcon,
  EllipsisHorizontalCircleIcon,
  EyeIcon,
  MagnifyingGlassCircleIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  QuestionMarkCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline"

const STATUS_CONFIG = {
  planning: {
    label: "Planejamento",
    acro: "PLAN",
    icon: MagnifyingGlassCircleIcon,
    style: "text-brand-accent bg-brand-accent/10"
  },
  todo: {
    label: "A Fazer",
    acro: "TODO",
    icon: PlayCircleIcon,
    style: "text-app-muted bg-app-muted/20"
  },
  in_progress: {
    label: "Em Andamento",
    acro: "PROG",
    icon: EllipsisHorizontalCircleIcon,
    style: "text-brand-primary bg-brand-primary/10 animate-pulse"
  },
  in_review: {
    label: "Em Revisão",
    acro: "REVW",
    icon: EyeIcon,
    style: "text-brand-accent bg-brand-accent/10"
  },
  done: {
    label: "Concluído",
    acro: "DONE",
    icon: CheckCircleIcon,
    style: "text-brand-success bg-brand-success/10"
  },
  paused: {
    label: "Pausado",
    acro: "PAUS",
    icon: PauseCircleIcon,
    style: "text-app-muted bg-app-muted/20"
  },
  cancelled: {
    label: "Cancelado",
    acro: "CNCL",
    icon: XCircleIcon,
    style: "text-brand-danger bg-brand-danger/10"
  }
}

export default function StatusBadge({
  status,
  className = "",
  showLabel = true
}) {
  if (!status) return null
  const config = STATUS_CONFIG[status.toLowerCase().trim()] || {
    icon: QuestionMarkCircleIcon,
    label: "Desconhecido",
    acro: "UNKN",
    style: "text-app-muted bg-app-muted/20"
  }

  const Icon = config.icon
  return (
    <span
      className={`inline-flex flex-none grow-0 items-start gap-1 font-mono text-xs font-extrabold tracking-widest ${config.style} ${className} ${!showLabel ? "bg-transparent" : "rounded px-2 py-0.5"}`}
    >
      <Icon className="h-4 w-4" />
      <span className={showLabel ? "" : "hidden"} aria-label={config.label}>
        {config.acro}
      </span>
    </span>
  )
}
