import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '../lib/api/tags';

export function useTags() {
  return useQuery({ queryKey: ['tags'], queryFn: tagsApi.list });
}

export function useTagLinks() {
  return useQuery({ queryKey: ['tagLinks'], queryFn: tagsApi.listLinks });
}

export function useTagMutations() {
  const qc = useQueryClient();
  const invalidateTags = () => qc.invalidateQueries({ queryKey: ['tags'] });
  const invalidateLinks = () =>
    qc.invalidateQueries({ queryKey: ['tagLinks'] });
  return {
    create: useMutation({
      mutationFn: tagsApi.create,
      onSuccess: invalidateTags,
    }),
    remove: useMutation({
      mutationFn: tagsApi.remove,
      onSuccess: () => {
        invalidateTags();
        invalidateLinks();
      },
    }),
    attach: useMutation({
      mutationFn: ({ tagId, entityType, entityId }) =>
        tagsApi.attach(tagId, entityType, entityId),
      onSuccess: invalidateLinks,
    }),
    detach: useMutation({
      mutationFn: ({ tagId, entityType, entityId }) =>
        tagsApi.detach(tagId, entityType, entityId),
      onSuccess: invalidateLinks,
    }),
  };
}
