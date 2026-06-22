import { supabase } from '../supabaseClient'

function unwrap({ data, error }) {
  if (error) throw error
  return data
}

export const tagsApi = {
  list: () => supabase.from('work_tags').select('*').order('name', { ascending: true }).then(unwrap),
  create: (name) => supabase.from('work_tags').insert({ name, synonyms: [] }).select().single().then(unwrap),
  remove: (id) => supabase.from('work_tags').delete().eq('id', id).then(unwrap),

  listLinks: () => supabase.from('work_tag_entities').select('*').then(unwrap),

  listForEntity: (entityType, entityId) =>
    supabase
      .from('work_tag_entities')
      .select('*, work_tags(*)')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .then(unwrap),

  attach: (tagId, entityType, entityId) =>
    supabase
      .from('work_tag_entities')
      .insert({ work_tag_id: tagId, entity_type: entityType, entity_id: entityId })
      .then(unwrap),

  detach: (tagId, entityType, entityId) =>
    supabase
      .from('work_tag_entities')
      .delete()
      .eq('work_tag_id', tagId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .then(unwrap),
}
