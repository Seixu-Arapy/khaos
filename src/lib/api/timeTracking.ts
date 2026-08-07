import { supabase } from '../supabaseClient';
import type { Id, TaskLog } from '../types';

function unwrap<T>({ data, error }: { data: T | null; error: unknown }): T {
  if (error) throw error;
  return data as T;
}

export interface ListAllOptions {
  since?: string;
}

export const timeTrackingApi = {
  start: async (
    taskId?: Id,
    note?: string,
    projectId?: Id,
    background?: boolean
  ): Promise<TaskLog> => {
    const response = await supabase
      .from('task_logs')
      .insert({
        task_id: taskId ?? null,
        note: note ?? null,
        project_id: projectId ?? null,
        background: background ?? false,
      })
      .select()
      .single();
    return unwrap(response);
  },

  // Stops the single foreground (background = false) log, if one is open.
  stop: async (): Promise<unknown> => {
    const response = await supabase.rpc('stop_active_task');
    return unwrap(response);
  },

  // Stops one specific open log by id — used for background logs, since
  // any number of those can be open at once.
  stopLog: async (id: Id): Promise<unknown> => {
    const response = await supabase.rpc('stop_task_log', { p_id: id });
    return unwrap(response);
  },

  // Returns every currently open log (at most one foreground, any number
  // of background).
  async getActive(): Promise<TaskLog[]> {
    const response = await supabase.rpc('get_active_task_log');
    return unwrap<TaskLog[]>(response);
  },

  listByTask: async (taskId: Id): Promise<TaskLog[]> => {
    const response = await supabase
      .from('task_logs')
      .select('*')
      .eq('task_id', taskId)
      .order('duration', { ascending: false });
    return unwrap(response);
  },

  listAll: async ({ since }: ListAllOptions = {}): Promise<unknown[]> => {
    let query = supabase
      .from('task_logs')
      .select('*, tasks(id, name, section_id)')
      .order('duration', { ascending: false });
    if (since) query = query.gte('duration', since);

    const response = await query;
    return unwrap(response);
  },

  update: async (id: Id, patch: Partial<TaskLog>): Promise<TaskLog> => {
    const response = await supabase
      .from('task_logs')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    return unwrap(response);
  },

  remove: async (id: Id): Promise<TaskLog> => {
    const response = await supabase
      .from('task_logs')
      .delete()
      .eq('id', id)
      .select()
      .single();
    return unwrap(response);
  },
};
