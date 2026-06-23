import { supabase } from '../supabaseClient';

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export const momentsApi = {
  listForEntity: (entityType, entityId) =>
    supabase
      .from('moments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('time', { ascending: false })
      .then(unwrap),

  addNote: (entityType, entityId, note) =>
    supabase
      .from('moments')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        moment_type: 'note',
        moment_note: note,
      })
      .select()
      .single()
      .then(unwrap),

  remove: (id) => supabase.from('moments').delete().eq('id', id).then(unwrap),
};
