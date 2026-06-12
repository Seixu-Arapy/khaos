import { useState } from "react"

import {
  BoltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  RocketLaunchIcon,
  SparklesIcon,
  StarIcon,
  SunIcon
} from "@heroicons/react/24/outline"

// ─────────────────────────────────────────────
// Free task options (no predecessor)
// ─────────────────────────────────────────────

const FREE_OPTIONS = [
  { icon: SparklesIcon, title: "Pronta para começar!" },
  { icon: RocketLaunchIcon, title: "Pode decolar!" },
  { icon: BoltIcon, title: "Energia livre!" },
  { icon: StarIcon, title: "É a sua vez!" },
  { icon: SunIcon, title: "Caminho aberto!" }
]

const ANIMATION_BY_ICON = {
  SparklesIcon: "animate-wiggle",
  RocketLaunchIcon: "animate-bounce_lr",
  BoltIcon: "animate-bounce",
  StarIcon: "animate-wiggle",
  SunIcon: "animate-spin [animation-duration:4s]"
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function NoBefore({ status }) {
  const [option] = useState(
    () => FREE_OPTIONS[Math.floor(Math.random() * FREE_OPTIONS.length)]
  )

  if (status !== "todo") return null

  const Icon = option.icon
  const animation = ANIMATION_BY_ICON[Icon.displayName] ?? "animate-bounce_lr"

  return (
    <span
      title={option.title}
      className="inline-flex items-center text-brand-success"
    >
      <Icon className={`h-3.5 w-3.5 ${animation}`} />
    </span>
  )
}

function HasBefore({ task }) {
  if (!task) return null
  return (
    <span
      title={`Aguarda: ${task.name}`}
      className="inline-flex items-center gap-0.5 rounded border border-app-border bg-app-surface px-1 py-0.5 font-mono text-[10px] text-app-muted"
    >
      <ChevronLeftIcon className="h-3 w-3 text-brand-accent" />
      {task.id}
    </span>
  )
}

function HasNext({ task }) {
  if (!task) return null
  return (
    <span
      title={`Precede: ${task.name}`}
      className="inline-flex items-center gap-0.5 rounded border border-app-border bg-app-surface px-1 py-0.5 font-mono text-[10px] text-app-muted"
    >
      {task.id}
      <ChevronRightIcon className="h-3 w-3 text-brand-primary" />
    </span>
  )
}

// ─────────────────────────────────────────────
// Main component
//
// Props:
//   previous_task: { id, name } | null
//   next_task:     { id, name } | null
// ─────────────────────────────────────────────

export default function SequenceIndicator({ previous_task, next_task }) {
  const isFree = !previous_task

  return (
    <span className="inline-flex items-center gap-1">
      {isFree ? (
        <NoBefore status={status} />
      ) : (
        <HasBefore task={previous_task} />
      )}
      {next_task && <HasNext task={next_task} />}
    </span>
  )
}
