import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTasksSequence } from './useHierarchy';
import { sequenceApi } from '../lib/api/sequence';

// Map<taskId, { before: number, after: number }> — contagens leves para os
// indicadores do TaskRow, a partir do mesmo cache de useTasksSequence.
export function useSequenceCounts() {
  const { data: edges = [] } = useTasksSequence();
  return useMemo(() => {
    const map = new Map();
    const bucket = (id) => {
      if (!map.has(id)) map.set(id, { before: 0, after: 0 });
      return map.get(id);
    };
    edges.forEach((e) => {
      bucket(e.task_next).before += 1;
      bucket(e.task_previous).after += 1;
    });
    return map;
  }, [edges]);
}

// Tasks completas que vêm antes/depois de uma task, para o
// TaskDetailModal. `tasksById` é o Map(tasks por id) já calculado pelo
// chamador.
export function useTaskSequence(taskId, tasksById) {
  const { data: edges = [] } = useTasksSequence();
  return useMemo(() => {
    if (!taskId) return { before: [], after: [] };
    const before = edges
      .filter((e) => e.task_next === taskId)
      .map((e) => tasksById.get(e.task_previous))
      .filter(Boolean);
    const after = edges
      .filter((e) => e.task_previous === taskId)
      .map((e) => tasksById.get(e.task_next))
      .filter(Boolean);
    return { before, after };
  }, [edges, taskId, tasksById]);
}

export function useSequenceMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['tasksSequence'] });
  return {
    add: useMutation({
      mutationFn: ({ previousId, nextId }) =>
        sequenceApi.add(previousId, nextId),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: ({ previousId, nextId }) =>
        sequenceApi.remove(previousId, nextId),
      onSuccess: invalidate,
    }),
  };
}
