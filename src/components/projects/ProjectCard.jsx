import { useNavigate } from 'react-router-dom'
import { StatusBadge, PriorityBadge } from '../common/ui'
import { formatDue, isOverdue } from '../../lib/dateUtils'

export default function ProjectCard({ project, sectionCount, taskCount, doneCount }) {
  const navigate = useNavigate()
  const pct = taskCount ? Math.round((doneCount / taskCount) * 100) : 0
  const overdue = isOverdue(project.due, project.status)

  return (
    <button
      onClick={() => navigate(`/projects/${project.id}`)}
      className="flex flex-col gap-2.5 rounded-lg border border-ink-700 bg-ink-800/40 p-4 text-left transition-colors hover:border-ink-600 hover:bg-ink-800"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-ink-100">{project.name}</h3>
        <PriorityBadge priority={project.priority} />
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={project.status} />
        {project.due && (
          <span className={overdue ? 'text-xs font-medium text-rust-500' : 'text-xs text-ink-500'}>
            {formatDue(project.due)}
          </span>
        )}
      </div>
      <div className="text-xs text-ink-500">
        {sectionCount} section{sectionCount === 1 ? '' : 's'} · {taskCount} task{taskCount === 1 ? '' : 's'}
      </div>
      {Boolean(taskCount) && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
          <div className="h-full rounded-full bg-sage-500" style={{ width: `${pct}%` }} />
        </div>
      )}
    </button>
  )
}
