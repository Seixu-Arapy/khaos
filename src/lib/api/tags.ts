import { supabase } from '../supabaseClient';
import type { Id } from '../types';

function unwrap<T>({ data, error }: { data: T | null; error: unknown }): T {
  if (error) throw error;
  return data as T;
}

export type TagEntityRef = Record<string, Id>;

export const tagsApi = {
  list: async (): Promise<unknown[]> => {
    const response = await supabase
      .from('work_tags')
      .select('*')
      .order('name', { ascending: true });
    return unwrap(response);
  },

  create: async (name: string): Promise<unknown> => {
    const response = await supabase
      .from('work_tags')
      .insert({ name, synonyms: [] })
      .select()
      .single();
    return unwrap(response);
  },

  remove: async (id: Id): Promise<unknown> => {
    const response = await supabase
      .from('work_tags')
      .delete()
      .eq('id', id)
      .select()
      .single();
    return unwrap(response);
  },

  listLinks: async (): Promise<unknown[]> => {
    const response = await supabase.from('work_tag_entities').select('*');
    return unwrap(response);
  },

  listForEntity: async (entityRef: TagEntityRef): Promise<unknown[]> => {
    let query = supabase.from('work_tag_entities').select('*, work_tags(*)');
    for (const [column, value] of Object.entries(entityRef)) {
      query = query.eq(column, value);
    }
    const response = await query;
    return unwrap(response);
  },

  attach: async (tagId: Id, entityRef: TagEntityRef): Promise<unknown> => {
    const response = await supabase
      .from('work_tag_entities')
      .insert({
        work_tag_id: tagId,
        ...entityRef,
      })
      .select()
      .single();
    return unwrap(response);
  },

  detach: async (tagId: Id, entityRef: TagEntityRef): Promise<unknown> => {
    let query = supabase
      .from('work_tag_entities')
      .delete()
      .eq('work_tag_id', tagId);
    for (const [column, value] of Object.entries(entityRef)) {
      query = query.eq(column, value);
    }
    const response = await query;
    return unwrap(response);
  },
};
