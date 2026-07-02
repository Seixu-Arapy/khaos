import { supabase } from '../supabaseClient';
import { isOpenRange } from '../range';
import type { Id, TaskLog } from '../types';

function unwrap<T>({ data, error }: { data: T | null; error: unknown }): T {
  if (error) throw error;
  return data as T;
}

export interface ListAllOptions {
  since?: string;
}

export const timeTrackingApi = {
  start: async (taskId: Id): Promise<TaskLog> => {
    const response = await supabase
      .from('task_logs')
      .insert({ task_id: taskId })
      .select()
      .single();
    return unwrap(response);
  },

  stop: async (): Promise<unknown> => {
    const response = await supabase.rpc('stop_active_task');
    return unwrap(response);
  },

  async getActive(): Promise<TaskLog | null> {
    const response = await supabase
      .from('task_logs')
      .select('*')
      .order('id', { ascending: false })
      .limit(25);

    const rows = unwrap<TaskLog[]>(response);
    return rows.find((row) => isOpenRange(row.duration)) || null;
  },

  listByTask: async (taskId: Id): Promise<TaskLog[]> => {
    const response = await supabase
      .from('task_logs')
      .select('*')
      .eq('task_id', taskId)
      .order('id', { ascending: false });
    return unwrap(response);
  },

  listAll: async ({ since }: ListAllOptions = {}): Promise<unknown[]> => {
    let query = supabase
      .from('task_logs')
      .select('*, tasks(id, name, section_id)')
      .order('id', { ascending: false });
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
