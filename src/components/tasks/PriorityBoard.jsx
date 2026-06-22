import { DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { PRIORITIES, PRIORITY_META } from '../../lib/constants'
import { StatusBadge } from '../common/ui'
import { useTaskMutations } from '../../hooks/useHierarchy'

function Card({ task, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 10 } : undefined
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => !isDragging && onOpen(task)}
      className="cursor-grab rounded-md border border-ink-700 bg-ink-800 p-2.5 text-sm text-ink-100 shadow-card active:cursor-grabbing"
    >
      <p className="mb-1.5 leading-snug">{task.name}</p>
      <StatusBadge status={task.status} />
    </div>
  )
}

function Column({ priority, tasks, onOpen }) {
  const { setNodeRef, isOver } = useDroppable({ id: priority })
  const meta = PRIORITY_META[priority]
  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col rounded-lg border ${isOver ? 'border-copper-400' : 'border-ink-700'} bg-ink-900`}
    >
      <div className="flex items-center gap-1.5 border-b border-ink-700 px-3 py-2">
        <span className={`text-xs font-semibold uppercase tracking-wide ${meta.text}`}>{meta.label}</span>
        <span className="ml-auto text-xs text-ink-600">{tasks.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
        {tasks.map((task) => (
          <Card key={task.id} task={task} onOpen={onOpen} />
        ))}
      </div>
    </div>
  )
}

export default function PriorityBoard({ tasks, onOpenTask }) {
  const { update } = useTaskMutations()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleDragEnd(e) {
    const { active, over } = e
    if (!over) return
    const task = tasks.find((t) => t.id === active.id)
    if (task && task.priority !== over.id) {
      update.mutate({ id: active.id, patch: { priority: over.id } })
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {PRIORITIES.map((priority) => (
          <Column
            key={priority}
            priority={priority}
            tasks={tasks.filter((t) => (t.priority || 'medium') === priority)}
            onOpen={onOpenTask}
          />
        ))}
      </div>
    </DndContext>
  )
}
