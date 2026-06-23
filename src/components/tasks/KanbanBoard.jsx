import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { STATUSES, STATUS_META } from '../../lib/constants';
import { PriorityBadge } from '../common/ui';
import { useTaskMutations } from '../../hooks/useHierarchy';

function Card({ task, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 10 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => !isDragging && onOpen(task)}
      className="border-ink-700 bg-ink-800 text-ink-100 shadow-card cursor-grab rounded-md border p-2.5 text-sm active:cursor-grabbing"
    >
      <p className="mb-1.5 leading-snug">{task.name}</p>
      <PriorityBadge priority={task.priority} />
    </div>
  );
}

function Column({ status, tasks, onOpen }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = STATUS_META[status];
  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col rounded-lg border ${isOver ? 'border-copper-400' : 'border-ink-700'} bg-ink-900`}
    >
      <div className="border-ink-700 flex items-center gap-1.5 border-b px-3 py-2">
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
        <span className="text-ink-400 text-xs font-semibold tracking-wide uppercase">
          {meta.label}
        </span>
        <span className="text-ink-600 ml-auto text-xs">{tasks.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
        {tasks.map((task) => (
          <Card key={task.id} task={task} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoard({ tasks, onOpenTask }) {
  const { update } = useTaskMutations();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(e) {
    const { active, over } = e;
    if (!over) return;
    const taskId = active.id;
    const newStatus = over.id;
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      update.mutate({ id: taskId, patch: { status: newStatus } });
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            onOpen={onOpenTask}
          />
        ))}
      </div>
    </DndContext>
  );
}
