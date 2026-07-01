import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routinesApi } from '../lib/api/routines';

export function useRoutines() {
  return useQuery({ queryKey: ['routines'], queryFn: routinesApi.list });
}

export function useRoutineMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['routines'] });
  return {
    create: useMutation({
      mutationFn: routinesApi.create,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, patch }) => routinesApi.update(id, patch),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: routinesApi.remove,
      onSuccess: invalidate,
    }),
  };
}
