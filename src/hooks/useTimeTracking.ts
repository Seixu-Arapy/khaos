import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeTrackingApi } from '../lib/api/timeTracking';
import type { Id, TaskLogPatch } from '../lib/types';

// Returns every currently open log (at most one foreground, any number of
// background). Use the foreground/background helpers below to split them.
export function useActiveTimer() {
  return useQuery({
    queryKey: ['activeTimer'],
    queryFn: timeTrackingApi.getActive,
    refetchInterval: 30_000,
  });
}

export function useForegroundTimer() {
  const query = useActiveTimer();
  return {
    ...query,
    data: query.data?.find((log) => !log.background) ?? null,
  };
}

export function useBackgroundTimers() {
  const query = useActiveTimer();
  return {
    ...query,
    data: query.data?.filter((log) => log.background) ?? [],
  };
}

export function useTaskLogs(taskId: Id | undefined) {
  return useQuery({
    queryKey: ['taskLogs', taskId],
    queryFn: () => timeTrackingApi.listByTask(taskId as Id),
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
      mutationFn: (
        {
          taskId,
          note,
          projectId,
          background,
        }: { taskId?: Id; note?: string; projectId?: Id; background?: boolean } = {}
      ) => timeTrackingApi.start(taskId, note, projectId, background),
      onSuccess: invalidateAll,
    }),
    stop: useMutation({
      mutationFn: () => timeTrackingApi.stop(),
      onSuccess: invalidateAll,
    }),
    stopLog: useMutation({
      mutationFn: (id: Id) => timeTrackingApi.stopLog(id),
      onSuccess: invalidateAll,
    }),
    updateLog: useMutation({
      mutationFn: ({ id, patch }: { id: Id; patch: TaskLogPatch }) =>
        timeTrackingApi.update(id, patch),
      onSuccess: invalidateAll,
    }),
    removeLog: useMutation({
      mutationFn: (id: Id) => timeTrackingApi.remove(id),
      onSuccess: invalidateAll,
    }),
  };
}
