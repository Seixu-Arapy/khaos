import {
  BoltIcon,
  ChevronDoubleUpIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MinusIcon
} from "@heroicons/react/24/outline"

const PRIORITY_CONFIG = {
  urgent: {
    icon: BoltIcon,
    label: "Urgente",
    style: "text-brand-danger animate-bounce"
  },
  high: {
    icon: ChevronDoubleUpIcon,
    label: "Alta",
    style: "text-brand-accent"
  },
  medium: {
    icon: ChevronUpIcon,
    label: "Média",
    style: "text-brand-primary"
  },
  low: {
    icon: ChevronDownIcon,
    label: "Baixa",
    style: "text-brand-success"
  },
  none: {
    icon: MinusIcon,
    label: "Nenhuma",
    style: "text-transparent"
  }
}

export default function PriorityBadge({
  priority = "none",
  className = "",
  showLabel = true
}) {
  const raw = (priority ?? "none").toLowerCase().trim()
  const config = PRIORITY_CONFIG[raw]
  const Icon = config.icon

  return (
    <span
      title={config.label}
      className={`inline-flex items-start gap-1.5 align-middle font-mono text-[11px] font-medium tracking-wider uppercase ${className}`}
    >
      <span className={`rounded-full px-1.5 py-0.5 ${config.style}`}>
        <Icon className="h-3.5 w-3.5" aria-label={config.label} />
      </span>
      {showLabel ?? <span>{config.label}</span>}
    </span>
  )
}
