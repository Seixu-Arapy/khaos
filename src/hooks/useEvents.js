import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '../lib/api/events';

export function useEvents() {
  return useQuery({ queryKey: ['events'], queryFn: eventsApi.list });
}

export function useEventMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['events'] });
  return {
    create: useMutation({
      mutationFn: eventsApi.create,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, patch }) => eventsApi.update(id, patch),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: eventsApi.remove,
      onSuccess: invalidate,
    }),
  };
}
