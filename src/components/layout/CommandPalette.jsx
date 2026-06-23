import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useProjects, useTasks } from '../../hooks/useHierarchy';
import { StatusBadge } from '../common/ui';

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useTasks();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const projectMatches = projects
      .filter((p) => !q || p.name.toLowerCase().includes(q))
      .slice(0, 6)
      .map((p) => ({
        type: 'project',
        id: p.id,
        label: p.name,
        status: p.status,
      }));
    const taskMatches = tasks
      .filter((t) => !q || t.name.toLowerCase().includes(q))
      .slice(0, 8)
      .map((t) => ({
        type: 'task',
        id: t.id,
        label: t.name,
        status: t.status,
      }));
    return [...projectMatches, ...taskMatches];
  }, [query, projects, tasks]);

  function go(item) {
    onClose();
    if (item.type === 'project') navigate(`/projects/${item.id}`);
    else navigate(`/tasks?taskId=${item.id}`);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="border-ink-700 bg-ink-800 shadow-panel w-full max-w-lg overflow-hidden rounded-lg border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-ink-700 flex items-center gap-2 border-b px-4 py-3">
          <Search size={16} className="text-ink-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            placeholder="Jump to a project or task…"
            className="text-ink-100 placeholder:text-ink-500 flex-1 bg-transparent text-sm focus:outline-hidden"
          />
        </div>
        <div className="max-h-80 overflow-y-auto py-1.5">
          {results.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              onClick={() => go(item)}
              className="text-ink-200 hover:bg-ink-700 flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm"
            >
              <span className="truncate">{item.label}</span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-ink-600 text-xs tracking-wide uppercase">
                  {item.type}
                </span>
                <StatusBadge status={item.status} />
              </span>
            </button>
          ))}
          {!results.length && (
            <p className="text-ink-600 px-4 py-6 text-center text-sm">
              Nothing found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
