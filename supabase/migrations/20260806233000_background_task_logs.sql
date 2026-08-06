-- Lets more than one task_log run at once: a "background" log (e.g. a long
-- passive activity) can stay open while the user starts and stops
-- foreground logs on top of it. Only one foreground (background = false)
-- log may be open at a time — background logs don't compete for that slot
-- and any number of them may be open concurrently.
alter table "public"."task_logs" add column "background" boolean not null default false;

comment on column "public"."task_logs"."background" is
    'False (default) for the single foreground log that Start/Stop track. True for a log that runs alongside others without being stopped when a new log starts — any number of background logs may be open at once.';

-- Starting a new foreground log still auto-closes the previous foreground
-- log (existing behavior). Starting a background log no longer touches any
-- other open log — foreground or background.
create or replace function "public"."trg_fn_stop_and_start_task_log"() returns "trigger"
    language "plpgsql"
    as $$
begin
  if new.background then
    return new;
  end if;

  -- Close the existing open foreground log by setting its upper bound to now()
  update task_logs
  set duration = tstzrange(lower(duration), now(), '[)')
  where upper_inf(duration) = true
    and background = false;

  return new;
end;
$$;

-- active_task_log previously exposed only id/task_id/duration, from before
-- note/project_id existed. Widen it to the full row so callers (including
-- get_active_task_log below) see every open log, foreground or background.
create or replace view "public"."active_task_log" with ("security_invoker"='on') as
 select *
   from "public"."task_logs"
  where ("upper_inf"("duration") = true);

comment on view "public"."active_task_log" is 'All currently open (not yet stopped) task_logs — any number of background logs plus at most one foreground (background = false) log.';

-- get_active_task_log (added in the previous migration) used to cap at a
-- single row assuming only one log could ever be open. Now that background
-- logs can run concurrently, return every open row.
create or replace function "public"."get_active_task_log"() returns setof "public"."task_logs"
    language "sql" stable
    as $$
  select * from task_logs where upper_inf(duration) = true;
$$;

-- stop_active_task stopped "the" open log, which only worked when at most
-- one could be open. Scope it to the foreground slot specifically, and add
-- stop_task_log to close any one open log (foreground or background) by id
-- — needed now that a caller must say *which* running log to stop.
create or replace function "public"."stop_active_task"() returns setof "public"."task_logs"
    language "plpgsql"
    as $$begin
  return query
  update task_logs
  set duration = tstzrange(lower(duration), now(), '[)')
  where upper_inf(duration) = true
    and background = false
  returning *;
end;$$;

create or replace function "public"."stop_task_log"("p_id" "uuid") returns setof "public"."task_logs"
    language "plpgsql"
    as $$begin
  return query
  update task_logs
  set duration = tstzrange(lower(duration), now(), '[)')
  where id = p_id
    and upper_inf(duration) = true
  returning *;
end;$$;

alter function "public"."stop_task_log"("uuid") owner to "postgres";

grant all on function "public"."stop_task_log"("uuid") to "anon";
grant all on function "public"."stop_task_log"("uuid") to "authenticated";
grant all on function "public"."stop_task_log"("uuid") to "service_role";
