import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isToday } from 'date-fns'
import { AlertTriangle, CalendarClock, CheckCircle2 } from 'lucide-react'
import { useTasks, useSections, useProjects } from '../hooks/useHierarchy'
import { useEvents } from '../hooks/useEvents'
import { OPEN_STATUSES } from '../lib/constants'
import { formatDue, isOverdue } from '../lib/dateUtils'
import { parseRange } from '../lib/range'
import { StatusBadge, PriorityBadge, EmptyState } from '../components/common/ui'
import TaskDetailModal from '../components/tasks/TaskDetailModal'

export default function DashboardPage() {
  const { data: tasks = [] } = useTasks()
  const { data: sections = [] } = useSections()
  const { data: projects = [] } = useProjects()
  const { data: events = [] } = useEvents()
  const [searchParams, setSearchParams] = useSearchParams()

  const sectionsById = useMemo(() => new Map(sections.map((s) => [s.id, s])), [sections])
  const projectsById = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects])

  const openTasks = tasks.filter((t) => OPEN_STATUSES.includes(t.status))
  const overdue = openTasks.filter((t) => isOverdue(t.due, t.status))
  const dueToday = openTasks.filter((t) => t.due && isToday(new Date(t.due)) && !isOverdue(t.due, t.status))
  const todaysEvents = events
    .map((e) => ({ ...e, ...parseRange(e.duration) }))
    .filter((e) => e.start && isToday(e.start))
    .sort((a, b) => a.start - b.start)

  const openTaskId = searchParams.get('taskId')
  const openTask = openTaskId ? tasks.find((t) => t.id === Number(openTaskId)) : null
  function openTask_(task) {
    setSearchParams({ taskId: String(task.id) })
  }
  function closeTask() {
    searchParams.delete('taskId')
    setSearchParams(searchParams)
  }

  function projectLabel(task) {
    const section = sectionsById.get(task.section_id)
    return section ? projectsById.get(section.project_id)?.name : null
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-5">
      <h1 className="mb-1 font-display text-2xl text-ink-100">Today</h1>
      <p className="mb-6 text-sm text-ink-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rust-500">
            <AlertTriangle size={13} /> Overdue ({overdue.length})
          </h2>
          {!overdue.length ? (
            <p className="text-sm text-ink-600">Nothing overdue. Good work.</p>
          ) : (
            <div className="space-y-1">
              {overdue.map((task) => (
                <TaskRow key={task.id} task={task} project={projectLabel(task)} onOpen={openTask_} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-copper-400">
            <CheckCircle2 size={13} /> Due today ({dueToday.length})
          </h2>
          {!dueToday.length ? (
            <p className="text-sm text-ink-600">Nothing due today.</p>
          ) : (
            <div className="space-y-1">
              {dueToday.map((task) => (
                <TaskRow key={task.id} task={task} project={projectLabel(task)} onOpen={openTask_} />
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-6">
        <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-teal-400">
          <CalendarClock size={13} /> Today's calendar
        </h2>
        {!todaysEvents.length ? (
          <EmptyState icon={CalendarClock} title="Nothing on the calendar today" />
        ) : (
          <div className="divide-y divide-ink-700 rounded-lg border border-ink-700">
            {todaysEvents.map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 px-3.5 py-2.5">
                <span className="w-20 shrink-0 font-mono text-xs text-ink-400">
                  {ev.start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                </span>
                <span className="text-sm text-ink-100">{ev.name}</span>
                <span className="ml-auto text-xs text-ink-600">{ev.event_type}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {openTask && <TaskDetailModal taskId={openTask.id} task={openTask} onClose={closeTask} />}
    </div>
  )
}

function TaskRow({ task, project, onOpen }) {
  return (
    <button
      onClick={() => onOpen(task)}
      className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left hover:bg-ink-800"
    >
      <StatusBadge status={task.status} />
      <span className="min-w-0 flex-1 truncate text-sm text-ink-100">{task.name}</span>
      {project && <span className="hidden shrink-0 text-xs text-ink-500 sm:block">{project}</span>}
      <PriorityBadge priority={task.priority} />
      {task.due && <span className="shrink-0 text-xs text-ink-500">{formatDue(task.due)}</span>}
    </button>
  )
}
