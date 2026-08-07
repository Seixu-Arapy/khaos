import { supabase } from '../supabaseClient';
import type { Id, Moment } from '../types';

function unwrap<T>({ data, error }: { data: T | null; error: unknown }): T {
  if (error) throw error;
  return data as T;
}

export type EntityRef = Record<string, Id>;

export const momentsApi = {
  listForEntity: async (entityRef: EntityRef): Promise<Moment[]> => {
    let query = supabase.from('moments').select('*');
    for (const [column, value] of Object.entries(entityRef)) {
      query = query.eq(column, value);
    }
    const response = await query.order('created_at', { ascending: false });
    return unwrap(response);
  },

  addNote: async (entityRef: EntityRef, note: string): Promise<Moment> => {
    const response = await supabase
      .from('moments')
      .insert({
        ...entityRef,
        moment_type: 'note',
        moment_note: note,
      })
      .select()
      .single();
    return unwrap(response);
  },

  // Latest 'status' moment timestamp per task, used to fade/hide settled
  // tasks in infinite sections based on how long ago they were done/cancelled.
  latestTaskStatusChanges: async (): Promise<Map<Id, string>> => {
    const response = await supabase
      .from('moments')
      .select('task_id, created_at')
      .eq('moment_type', 'status')
      .not('task_id', 'is', null)
      .order('created_at', { ascending: false });
    const rows = unwrap(response) as { task_id: Id; created_at: string }[];
    const latest = new Map<Id, string>();
    for (const row of rows) {
      if (!latest.has(row.task_id)) latest.set(row.task_id, row.created_at);
    }
    return latest;
  },

  remove: async (id: Id): Promise<Moment> => {
    const response = await supabase
      .from('moments')
      .delete()
      .eq('id', id)
      .select()
      .single();
    return unwrap(response);
  },
};
