import { supabase } from '../supabaseClient'
import { formatRange } from '../range'

function unwrap({ data, error }) {
  if (error) throw error
  return data
}

export const eventsApi = {
  list: () => supabase.from('events').select('*').then(unwrap),

  create: ({ name, eventType, recurrent, start, end, taskId, projectId, fieldId }) =>
    supabase
      .from('events')
      .insert({
        name,
        event_type: eventType,
        recurrent: Boolean(recurrent),
        duration: formatRange(start, end),
        task_id: taskId || null,
        project_id: projectId || null,
        field_id: fieldId || null,
      })
      .select()
      .single()
      .then(unwrap),

  update: (id, { name, eventType, recurrent, start, end, taskId, projectId, fieldId }) => {
    const patch = {}
    if (name !== undefined) patch.name = name
    if (eventType !== undefined) patch.event_type = eventType
    if (recurrent !== undefined) patch.recurrent = recurrent
    if (start !== undefined || end !== undefined) patch.duration = formatRange(start, end)
    if (taskId !== undefined) patch.task_id = taskId
    if (projectId !== undefined) patch.project_id = projectId
    if (fieldId !== undefined) patch.field_id = fieldId
    return supabase.from('events').update(patch).eq('id', id).select().single().then(unwrap)
  },

  remove: (id) => supabase.from('events').delete().eq('id', id).then(unwrap),
}
