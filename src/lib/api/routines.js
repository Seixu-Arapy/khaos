import { supabase } from '../supabaseClient';

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export const routinesApi = {
  list: () =>
    supabase
      .from('routines')
      .select('*, fields(name)')
      .order('name')
      .then(unwrap),

  create: (payload) =>
    supabase.from('routines').insert(payload).select().single().then(unwrap),

  update: (id, patch) =>
    supabase
      .from('routines')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
      .then(unwrap),

  remove: (id) => supabase.from('routines').delete().eq('id', id).then(unwrap),

  // Returns all active routines with their scheduled instances for a given week
  listWithEvents: async (weekStart, weekEnd) => {
    const [routines, events] = await Promise.all([
      supabase.from('routines').select('*').eq('active', true).then(unwrap),
      supabase
        .from('events')
        .select('*')
        .eq('event_type', 'routine')
        .gte('duration', `[${weekStart.toISOString()},`)
        .lte('duration', `[,${weekEnd.toISOString()})`)
        .then(unwrap),
    ]);
    return { routines, events };
  },
};
