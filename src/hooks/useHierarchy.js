import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fieldsApi,
  projectsApi,
  sectionsApi,
  tasksApi,
  taskItemsApi,
  tasksSequenceApi,
  sectionsSequenceApi,
} from '../lib/api/hierarchy';
import { orderFromEdges } from '../lib/reorder';

// ---------- Reads ----------
// Fetched as flat lists and grouped client-side — simplest correct approach
// at the scale of a single person's task manager.

export function useFields() {
  return useQuery({ queryKey: ['fields'], queryFn: fieldsApi.list });
}

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: projectsApi.list });
}

export function useSections() {
  return useQuery({ queryKey: ['sections'], queryFn: sectionsApi.list });
}

export function useTasks() {
  return useQuery({ queryKey: ['tasks'], queryFn: tasksApi.list });
}

export function useTasksSequence() {
  return useQuery({
    queryKey: ['tasksSequence'],
    queryFn: tasksSequenceApi.list,
  });
}

export function useSectionsSequence() {
  return useQuery({
    queryKey: ['sectionsSequence'],
    queryFn: sectionsSequenceApi.list,
  });
}

export function useTaskItems(taskId) {
  return useQuery({
    queryKey: ['taskItems', taskId],
    queryFn: () => taskItemsApi.listByTask(taskId),
    enabled: Boolean(taskId),
  });
}

// tasks_sequence agora é só o grafo de dependências (ver
// src/hooks/useDependencies.js) — não existe mais ordenação manual de
// tasks por linked-list. Sections continuam usando sections_sequence.
export function useOrderedSectionIds(projectId, sections, sequenceEdges) {
  const ids = sections
    .filter((s) => s.project_id === projectId)
    .map((s) => s.id);
  const edges = sequenceEdges
    .filter(
      (e) => ids.includes(e.section_previous) && ids.includes(e.section_next)
    )
    .map((e) => ({ prev: e.section_previous, next: e.section_next }));
  return orderFromEdges(ids, edges);
}

// ---------- Mutations ----------

export function useFieldMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['fields'] });
  return {
    create: useMutation({
      mutationFn: fieldsApi.create,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, patch }) => fieldsApi.update(id, patch),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: fieldsApi.remove,
      onSuccess: invalidate,
    }),
  };
}

export function useProjectMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['projects'] });
  return {
    create: useMutation({
      mutationFn: projectsApi.create,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, patch }) => projectsApi.update(id, patch),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: projectsApi.remove,
      onSuccess: invalidate,
    }),
  };
}

export function useSectionMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['sections'] });
  return {
    create: useMutation({
      mutationFn: sectionsApi.create,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, patch }) => sectionsApi.update(id, patch),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: sectionsApi.remove,
      onSuccess: invalidate,
    }),
    reorder: useMutation({
      mutationFn: ({ projectId, orderedIds }) =>
        sectionsApi.persistOrder(projectId, orderedIds),
      onSuccess: () => qc.invalidateQueries({ queryKey: ['sectionsSequence'] }),
    }),
  };
}

export function useTaskMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['tasks'] });
  return {
    create: useMutation({ mutationFn: tasksApi.create, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, patch }) => tasksApi.update(id, patch),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: tasksApi.remove, onSuccess: invalidate }),
    // reorder foi removido — ver comentário em tasksApi (hierarchy.ts).
  };
}

export function useTaskItemMutations(taskId) {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['taskItems', taskId] });
  return {
    create: useMutation({
      mutationFn: taskItemsApi.create,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, patch }) => taskItemsApi.update(id, patch),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: taskItemsApi.remove,
      onSuccess: invalidate,
    }),
  };
}
