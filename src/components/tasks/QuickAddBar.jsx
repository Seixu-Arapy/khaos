import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useProjects, useSections, useTaskMutations } from '../../hooks/useHierarchy'
import { parseQuickAdd } from '../../lib/quickAdd'
import { PRIORITIES } from '../../lib/constants'
import { Modal, Select, TextInput, Button } from '../common/ui'
import { toDatetimeLocalValue } from '../../lib/dateUtils'

export default function QuickAddBar() {
  const { data: projects = [] } = useProjects()
  const { data: sections = [] } = useSections()
  const { create } = useTaskMutations()

  const [raw, setRaw] = useState('')
  const [draft, setDraft] = useState(null) // { name, priority, dueDate, projectId, sectionId }

  const sectionsForProject = useMemo(
    () => sections.filter((s) => s.project_id === draft?.projectId),
    [sections, draft?.projectId]
  )

  function handleSubmit(e) {
    e.preventDefault()
    if (!raw.trim()) return
    const parsed = parseQuickAdd(raw, projects)
    const defaultSections = sections.filter((s) => s.project_id === parsed.projectId)
    setDraft({
      name: parsed.name || raw,
      priority: parsed.priority || 'medium',
      dueDate: parsed.dueDate,
      projectId: parsed.projectId || defaultSections[0]?.project_id || null,
      sectionId: defaultSections[0]?.id || null,
    })
  }

  function confirmCreate() {
    if (!draft.sectionId || !draft.name.trim()) return
    create.mutate(
      {
        section_id: draft.sectionId,
        name: draft.name.trim(),
        priority: draft.priority,
        due: draft.dueDate ? new Date(draft.dueDate).toISOString() : null,
      },
      { onSuccess: () => setDraft(null) }
    )
    setRaw('')
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="relative flex-1 max-w-xl">
        <Sparkles size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="Quick add: Finish report tomorrow 3pm #ProjectX !high"
          className="w-full rounded-full border border-ink-700 bg-ink-800 py-2 pl-9 pr-3 text-sm text-ink-100 placeholder:text-ink-500 focus:border-copper-400 focus:outline-none"
        />
      </form>

      <Modal
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title="New task"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button onClick={confirmCreate} disabled={!draft?.sectionId || !draft?.name.trim() || create.isPending}>
              Create task
            </Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-400">Name</label>
              <TextInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoFocus />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-400">Project</label>
                <Select
                  value={draft.projectId ?? ''}
                  className="w-full"
                  onChange={(e) => {
                    const projectId = Number(e.target.value)
                    const firstSection = sections.find((s) => s.project_id === projectId)
                    setDraft({ ...draft, projectId, sectionId: firstSection?.id ?? null })
                  }}
                >
                  <option value="" disabled>Choose a project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-400">Section</label>
                <Select
                  value={draft.sectionId ?? ''}
                  className="w-full"
                  onChange={(e) => setDraft({ ...draft, sectionId: Number(e.target.value) })}
                  disabled={!draft.projectId}
                >
                  <option value="" disabled>
                    {draft.projectId ? 'Choose a section' : 'Pick a project first'}
                  </option>
                  {sectionsForProject.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-400">Priority</label>
                <Select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-400">Due</label>
                <TextInput
                  type="datetime-local"
                  value={toDatetimeLocalValue(draft.dueDate)}
                  onChange={(e) => setDraft({ ...draft, dueDate: e.target.value ? new Date(e.target.value) : null })}
                />
              </div>
            </div>
            {!sectionsForProject.length && draft.projectId && (
              <p className="text-xs text-rust-500">This project has no sections yet — add one first.</p>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
