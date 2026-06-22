import { useState } from 'react'
import { Modal, TextInput, Select, Button } from '../common/ui'
import { EVENT_TYPES } from '../../lib/constants'
import { toDatetimeLocalValue } from '../../lib/dateUtils'
import { useEventMutations } from '../../hooks/useEvents'
import { useProjects, useTasks } from '../../hooks/useHierarchy'

export default function EventModal({ event, defaultStart, onClose }) {
  const { create, update, remove } = useEventMutations()
  const { data: projects = [] } = useProjects()
  const { data: tasks = [] } = useTasks()

  const [form, setForm] = useState(() => ({
    name: event?.name || '',
    eventType: event?.event_type || 'scheduled',
    recurrent: event?.recurrent || false,
    start: toDatetimeLocalValue(event ? parseStart(event.duration) : defaultStart),
    end: toDatetimeLocalValue(event ? parseEnd(event.duration) : addHour(defaultStart)),
    taskId: event?.task_id || '',
    projectId: event?.project_id || '',
  }))

  function parseStart(rangeStr) {
    const m = rangeStr?.match(/^[[(]"?([^",]*)"?,/)
    return m ? new Date(m[1]) : new Date()
  }
  function parseEnd(rangeStr) {
    const m = rangeStr?.match(/,"?([^",)\]]*)"?[)\]]$/)
    return m && m[1] ? new Date(m[1]) : addHour(new Date())
  }
  function addHour(date) {
    const d = new Date(date || Date.now())
    d.setHours(d.getHours() + 1)
    return d
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.start) return
    const payload = {
      name: form.name.trim(),
      eventType: form.eventType,
      recurrent: form.recurrent,
      start: new Date(form.start),
      end: form.end ? new Date(form.end) : null,
      taskId: form.taskId ? Number(form.taskId) : null,
      projectId: form.projectId ? Number(form.projectId) : null,
    }
    if (event) {
      update.mutate({ id: event.id, patch: payload }, { onSuccess: onClose })
    } else {
      create.mutate(payload, { onSuccess: onClose })
    }
  }

  function handleDelete() {
    if (window.confirm('Delete this event?')) {
      remove.mutate(event.id, { onSuccess: onClose })
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={event ? 'Edit event' : 'New event'}
      footer={
        <>
          {event && (
            <Button variant="danger" onClick={handleDelete} className="mr-auto">
              Delete
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>{event ? 'Save' : 'Create'}</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-400">Title</label>
          <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">Starts</label>
            <TextInput type="datetime-local" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">Ends</label>
            <TextInput type="datetime-local" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">Type</label>
            <Select value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} className="w-full">
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === 'fixed' ? 'Fixed (meeting)' : 'Plan (flexible)'}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-ink-300">
              <input
                type="checkbox"
                checked={form.recurrent}
                onChange={(e) => setForm({ ...form, recurrent: e.target.checked })}
                className="h-4 w-4 rounded border-ink-600 bg-ink-800 accent-copper-500"
              />
              Recurring
            </label>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">Linked project (optional)</label>
            <Select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="w-full">
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-400">Linked task (optional)</label>
            <Select value={form.taskId} onChange={(e) => setForm({ ...form, taskId: e.target.value })} className="w-full">
              <option value="">None</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </form>
    </Modal>
  )
}
