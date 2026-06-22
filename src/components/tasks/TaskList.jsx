import { useMemo, useState } from 'react'
import { ArrowUpDown } from 'lucide-react'
import { StatusBadge, PriorityBadge, EmptyState } from '../common/ui'
import { formatDue, isOverdue, minutesToHuman } from '../../lib/dateUtils'
import { ListTodo } from 'lucide-react'

const SORTERS = {
  due: (a, b) => new Date(a.due || 8640000000000000) - new Date(b.due || 8640000000000000),
  priority: (a, b) => priorityRank(a.priority) - priorityRank(b.priority),
  name: (a, b) => a.name.localeCompare(b.name),
}

function priorityRank(p) {
  return { urgent: 0, high: 1, medium: 2, low: 3 }[p] ?? 4
}

export default function TaskList({ tasks, projectsById, sectionsById, onOpenTask }) {
  const [sortKey, setSortKey] = useState('due')

  const sorted = useMemo(() => [...tasks].sort(SORTERS[sortKey]), [tasks, sortKey])

  if (!tasks.length) {
    return <EmptyState icon={ListTodo} title="No tasks here" hint="Try adjusting your filters, or quick-add a new task above." />
  }

  return (
    <div className="overflow-hidden rounded-lg border border-ink-700">
      <div className="flex items-center gap-2 border-b border-ink-700 bg-ink-800 px-3 py-2 text-xs text-ink-500">
        <button onClick={() => setSortKey('due')} className="flex items-center gap-1 hover:text-ink-200">
          Sort by due <ArrowUpDown size={11} />
        </button>
        <button onClick={() => setSortKey('priority')} className="flex items-center gap-1 hover:text-ink-200">
          Priority <ArrowUpDown size={11} />
        </button>
        <button onClick={() => setSortKey('name')} className="flex items-center gap-1 hover:text-ink-200">
          Name <ArrowUpDown size={11} />
        </button>
      </div>
      <div className="divide-y divide-ink-700">
        {sorted.map((task) => {
          const section = sectionsById.get(task.section_id)
          const project = section ? projectsById.get(section.project_id) : null
          const overdue = isOverdue(task.due, task.status)
          return (
            <button
              key={task.id}
              onClick={() => onOpenTask(task)}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left hover:bg-ink-800/60"
            >
              <StatusBadge status={task.status} />
              <span className="min-w-0 flex-1 truncate text-sm text-ink-100">{task.name}</span>
              {project && <span className="hidden shrink-0 truncate text-xs text-ink-500 sm:block max-w-[10rem]">{project.name}</span>}
              <PriorityBadge priority={task.priority} />
              {task.estimate ? (
                <span className="hidden shrink-0 font-mono text-xs text-ink-600 md:block">{minutesToHuman(task.estimate)}</span>
              ) : null}
              {task.due && (
                <span className={overdue ? 'shrink-0 text-xs font-medium text-rust-500' : 'shrink-0 text-xs text-ink-500'}>
                  {formatDue(task.due)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
