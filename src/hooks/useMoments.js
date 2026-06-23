import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { momentsApi } from '../lib/api/moments';

export function useNotes(entityType, entityId) {
  return useQuery({
    queryKey: ['moments', entityType, entityId],
    queryFn: () => momentsApi.listForEntity(entityType, entityId),
    enabled: Boolean(entityType && entityId),
  });
}

export function useNoteMutations(entityType, entityId) {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ['moments', entityType, entityId] });
  return {
    addNote: useMutation({
      mutationFn: (note) => momentsApi.addNote(entityType, entityId, note),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: momentsApi.remove,
      onSuccess: invalidate,
    }),
  };
}
