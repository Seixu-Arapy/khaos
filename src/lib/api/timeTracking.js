import { supabase } from '../supabaseClient';
import { isOpenRange } from '../range';

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export const timeTrackingApi = {
  // Starts a timer for a task. The duration column defaults to an open
  // range starting now (see schema default), so a plain insert is enough.
  start: (taskId) =>
    supabase
      .from('task_logs')
      .insert({ task_id: taskId })
      .select()
      .single()
      .then(unwrap),

  // Closes whichever task_log currently has an open (infinite) upper bound.
  // This mirrors the stop_active_task() Postgres function exactly — it does
  // not take a task id, it just closes whatever is currently running.
  stop: () => supabase.rpc('stop_active_task').then(unwrap),

  // Scans the most recent log rows for one with no end time. Cheap and
  // reliable at personal-project scale; avoids needing a DB view.
  async getActive() {
    const rows = await supabase
      .from('task_logs')
      .select('*')
      .order('id', { ascending: false })
      .limit(25)
      .then(unwrap);
    return rows.find((row) => isOpenRange(row.duration)) || null;
  },

  listByTask: (taskId) =>
    supabase
      .from('task_logs')
      .select('*')
      .eq('task_id', taskId)
      .order('id', { ascending: false })
      .then(unwrap),

  listAll: ({ since } = {}) => {
    let query = supabase
      .from('task_logs')
      .select('*, tasks(id, name, section_id)')
      .order('id', { ascending: false });
    if (since) query = query.gte('duration', since);
    return query.then(unwrap);
  },

  update: (id, patch) =>
    supabase
      .from('task_logs')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
      .then(unwrap),
  remove: (id) => supabase.from('task_logs').delete().eq('id', id).then(unwrap),
};
