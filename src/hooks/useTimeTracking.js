import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeTrackingApi } from '../lib/api/timeTracking';

export function useActiveTimer() {
  return useQuery({
    queryKey: ['activeTimer'],
    queryFn: timeTrackingApi.getActive,
    refetchInterval: 30_000,
  });
}

export function useTaskLogs(taskId) {
  return useQuery({
    queryKey: ['taskLogs', taskId],
    queryFn: () => timeTrackingApi.listByTask(taskId),
    enabled: Boolean(taskId),
  });
}

export function useAllTaskLogs() {
  return useQuery({
    queryKey: ['taskLogs', 'all'],
    queryFn: () => timeTrackingApi.listAll(),
  });
}

export function useTimerMutations() {
  const qc = useQueryClient();
  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['activeTimer'] });
    qc.invalidateQueries({ queryKey: ['taskLogs'] });
  };
  return {
    start: useMutation({
      mutationFn: (taskId) => timeTrackingApi.start(taskId),
      onSuccess: invalidateAll,
    }),
    stop: useMutation({
      mutationFn: timeTrackingApi.stop,
      onSuccess: invalidateAll,
    }),
    updateLog: useMutation({
      mutationFn: ({ id, patch }) => timeTrackingApi.update(id, patch),
      onSuccess: invalidateAll,
    }),
    removeLog: useMutation({
      mutationFn: timeTrackingApi.remove,
      onSuccess: invalidateAll,
    }),
  };
}
