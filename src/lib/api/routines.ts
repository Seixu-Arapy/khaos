import { supabase } from '../supabaseClient';
import type { Id, Routine, Event } from '../types';

function unwrap<T>({ data, error }: { data: T | null; error: unknown }): T {
  if (error) throw error;
  return data as T;
}

export interface ListWithEventsResult {
  routines: Routine[];
  events: Event[];
}

export const routinesApi = {
  list: async (): Promise<unknown[]> => {
    const response = await supabase
      .from('routines')
      .select('*, fields(name)')
      .order('name');
    return unwrap(response);
  },

  create: async (payload: Partial<Routine>): Promise<Routine> => {
    const response = await supabase
      .from('routines')
      .insert(payload)
      .select()
      .single();
    return unwrap(response);
  },

  update: async (id: Id, patch: Partial<Routine>): Promise<Routine> => {
    const response = await supabase
      .from('routines')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    return unwrap(response);
  },

  remove: async (id: Id): Promise<Routine> => {
    const response = await supabase
      .from('routines')
      .delete()
      .eq('id', id)
      .select()
      .single();
    return unwrap(response);
  },

  listWithEvents: async (
    weekStart: Date,
    weekEnd: Date
  ): Promise<ListWithEventsResult> => {
    const [routinesResult, eventsResult] = await Promise.all([
      supabase.from('routines').select('*').eq('active', true),
      supabase
        .from('events')
        .select('*')
        .eq('event_type', 'routine')
        .gte('duration', `[${weekStart.toISOString()},`)
        .lte('duration', `[,${weekEnd.toISOString()})`),
    ]);
    return {
      routines: unwrap<Routine[]>(routinesResult),
      events: unwrap<Event[]>(eventsResult),
    };
  },
};
