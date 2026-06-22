import { useEffect, useState } from 'react'
import { Square, Timer } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useActiveTimer, useTimerMutations } from '../../hooks/useTimeTracking'
import { useTasks } from '../../hooks/useHierarchy'
import { parseRange } from '../../lib/range'
import { liveStopwatch } from '../../lib/dateUtils'

export default function ActiveTimerWidget() {
  const { data: activeLog } = useActiveTimer()
  const { data: tasks = [] } = useTasks()
  const { stop } = useTimerMutations()
  const [, forceTick] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (!activeLog) return
    const id = setInterval(() => forceTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [activeLog])

  if (!activeLog) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-ink-700 px-3 py-1.5 text-xs text-ink-500">
        <Timer size={14} />
        No timer running
      </div>
    )
  }

  const { start } = parseRange(activeLog.duration)
  const task = tasks.find((t) => t.id === activeLog.task_id)

  return (
    <button
      onClick={() => task && navigate(`/tasks?taskId=${task.id}`)}
      className="group flex items-center gap-2.5 rounded-full border border-copper-500/40 bg-copper-500/10 py-1.5 pl-3 pr-1.5 text-xs transition-colors hover:bg-copper-500/15"
      title="Go to running task"
    >
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-copper-500" />
      <span className="max-w-[14rem] truncate font-medium text-ink-100">{task?.name || 'Untitled task'}</span>
      <span className="font-mono tabular text-copper-400">{liveStopwatch(start)}</span>
      <span
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation()
          stop.mutate()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.stopPropagation()
            stop.mutate()
          }
        }}
        aria-label="Stop timer"
        className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-ink-300 hover:bg-rust-500/20 hover:text-rust-500"
      >
        <Square size={11} fill="currentColor" />
      </span>
    </button>
  )
}
