import { useEffect, useState } from "react"

import AppIcon from "../AppIcon"
import Project from "./entities/Project"
import Task from "./entities/Task"

function formatTime(totalSeconds) {
  const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, "0")
  const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0")
  const secs = String(totalSeconds % 60).padStart(2, "0")
  return `${hrs}:${mins}:${secs}`
}

function getElapsedSeconds(startedAt) {
  if (!startedAt) return 0
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)
  )
}

export default function Timer({ activeTimer }) {
  const [seconds, setSeconds] = useState(() =>
    getElapsedSeconds(activeTimer[0]?.started_at)
  )

  useEffect(() => {
    if (!activeTimer[0]?.started_at) return

    const startTime = new Date(activeTimer[0].started_at).getTime()

    const tick = () => {
      setSeconds(Math.max(0, Math.floor((Date.now() - startTime) / 1000)))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [activeTimer])

  if (!activeTimer[0]) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-app-border bg-app-surface/50 px-3 py-1.5 text-xs whitespace-nowrap text-app-muted">
        <span className="text-[8px]">
          <AppIcon className="text-app-muted!" />
        </span>
        <span>Nenhum timer ativo</span>
      </div>
    )
  }

  const task = activeTimer?.[0]?.tasks
  const project = task?.sections?.projects

  return (
    <div className="flex scrollbar-none items-center gap-3 overflow-x-auto rounded-lg border border-app-border bg-app-surface px-3 py-1.5 whitespace-nowrap shadow-inner">
      <div className="flex shrink-0 items-center gap-2">
        <span className="animate-ping text-[8px]">
          <AppIcon className="text-brand-primary!" />
        </span>
        <span className="font-mono text-sm font-light tracking-wider text-brand-primary">
          {formatTime(seconds)}
        </span>
      </div>
      <div className="flex items-center gap-2 border-l border-app-border pl-3">
        <Project
          id={project?.id}
          name={project?.name}
          project={project}
          variant="inline"
        />
        <span className="shrink-0 text-xs text-app-muted select-none">›</span>
        <Task id={task?.id} name={task?.name} task={task} variant="inline" />
      </div>
    </div>
  )
}
