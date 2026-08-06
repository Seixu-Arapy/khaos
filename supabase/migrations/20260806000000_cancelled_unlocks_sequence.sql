-- Treat a cancelled task/section as resolved (like 'done') when evaluating
-- whether downstream sequence items can unlock from waiting to todo.
-- Previously, trg_tasks_unlock_next / trg_sections_unlock_next fired the
-- unlock check on cancellation, but check_and_unlock_next_tasks /
-- check_and_unlock_next_sections only excluded status = 'done' from the
-- pending count, so a cancelled predecessor left the next item stuck in
-- 'waiting' forever.

CREATE OR REPLACE FUNCTION "public"."check_and_unlock_next_tasks"("p_previous_task_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
declare
  r_next record;
  v_pending_count integer;
begin
  for r_next in
    SELECT ts.task_next
    FROM public.tasks_sequence ts
    JOIN public.tasks t ON t.id = ts.task_next
    WHERE ts.task_previous = p_previous_task_id AND t.status = 'waiting'
  loop

    SELECT count(*)
    INTO v_pending_count
    FROM public.tasks_sequence ts_check
    JOIN public.tasks t_check ON t_check.id = ts_check.task_previous
    WHERE ts_check.task_next = r_next.task_next
      AND t_check.status NOT IN ('done', 'cancelled')
      AND t_check.deleted_at IS NULL;

    if v_pending_count = 0 then
      UPDATE public.tasks
      SET status = 'todo'
      WHERE id = r_next.task_next;
    end if;

  end loop;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."check_and_unlock_next_sections"("p_previous_section_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
declare
  r_next record;
  v_pending_count integer;
begin
  for r_next in
    SELECT ss.section_next
    FROM public.sections_sequence ss
    JOIN public.sections s ON s.id = ss.section_next
    WHERE ss.section_previous = p_previous_section_id AND s.status = 'waiting'
  loop

    SELECT count(*)
    INTO v_pending_count
    FROM public.sections_sequence ss_check
    JOIN public.sections s_check ON s_check.id = ss_check.section_previous
    WHERE ss_check.section_next = r_next.section_next
      AND s_check.status NOT IN ('done', 'cancelled')
      AND s_check.deleted_at IS NULL;

    if v_pending_count = 0 then
      UPDATE public.sections
      SET status = 'todo'
      WHERE id = r_next.section_next;
    end if;

  end loop;
end;
$$;
