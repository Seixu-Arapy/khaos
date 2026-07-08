// Arestas de sequência entre tasks (tasks_sequence): task_previous vem
// antes de task_next. Não é ordenação manual de seção (isso já não existe
// mais — ver comentário em hierarchy.ts) — é a relação "esta tarefa só faz
// sentido depois daquela outra".

import { supabase } from '../supabaseClient';
import type { Id } from '../types';

function unwrap<T>({ data, error }: { data: T | null; error: unknown }): T {
  if (error) throw error;
  return data as T;
}

export const sequenceApi = {
  add: async (previousId: Id, nextId: Id): Promise<void> => {
    const response = await supabase
      .from('tasks_sequence')
      .insert({ task_previous: previousId, task_next: nextId });
    unwrap(response);
  },

  remove: async (previousId: Id, nextId: Id): Promise<void> => {
    const response = await supabase
      .from('tasks_sequence')
      .delete()
      .eq('task_previous', previousId)
      .eq('task_next', nextId);
    unwrap(response);
  },
};
