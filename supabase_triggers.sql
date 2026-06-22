-- ============================================================
-- 1. Add "definition" to the moment_types enum
-- ============================================================
alter type moment_types add value if not exists 'definition';


-- ============================================================
-- 2. Helper function — inserts a moment row
-- ============================================================
create or replace function insert_moment(
  p_entity_type text,
  p_entity_id   integer,
  p_moment_type moment_types,
  p_value       text default null,
  p_note        text default null
) returns void language plpgsql as $$
begin
  insert into moments (entity_type, entity_id, moment_type, value, moment_note, time)
  values (p_entity_type, p_entity_id, p_moment_type, p_value, p_note, now());
end;
$$;


-- ============================================================
-- 3. CREATED — fires on INSERT for projects, sections, tasks
-- ============================================================
create or replace function trg_moment_created() returns trigger language plpgsql as $$
begin
  perform insert_moment(TG_TABLE_NAME, NEW.id, 'created');
  return NEW;
end;
$$;

drop trigger if exists moment_created_projects  on projects;
drop trigger if exists moment_created_sections  on sections;
drop trigger if exists moment_created_tasks     on tasks;

create trigger moment_created_projects
  after insert on projects for each row execute function trg_moment_created();

create trigger moment_created_sections
  after insert on sections for each row execute function trg_moment_created();

create trigger moment_created_tasks
  after insert on tasks for each row execute function trg_moment_created();


-- ============================================================
-- 4. STATUS — fires when status column changes
-- ============================================================
create or replace function trg_moment_status() returns trigger language plpgsql as $$
begin
  if OLD.status is distinct from NEW.status then
    perform insert_moment(TG_TABLE_NAME, NEW.id, 'status', NEW.status::text);
  end if;
  return NEW;
end;
$$;

drop trigger if exists moment_status_projects on projects;
drop trigger if exists moment_status_sections on sections;
drop trigger if exists moment_status_tasks    on tasks;

create trigger moment_status_projects
  after update on projects for each row execute function trg_moment_status();

create trigger moment_status_sections
  after update on sections for each row execute function trg_moment_status();

create trigger moment_status_tasks
  after update on tasks for each row execute function trg_moment_status();


-- ============================================================
-- 5. DUE — fires when due date changes
-- ============================================================
create or replace function trg_moment_due() returns trigger language plpgsql as $$
begin
  if OLD.due is distinct from NEW.due then
    perform insert_moment(TG_TABLE_NAME, NEW.id, 'due', NEW.due::text);
  end if;
  return NEW;
end;
$$;

drop trigger if exists moment_due_projects on projects;
drop trigger if exists moment_due_sections on sections;
drop trigger if exists moment_due_tasks    on tasks;

create trigger moment_due_projects
  after update on projects for each row execute function trg_moment_due();

create trigger moment_due_sections
  after update on sections for each row execute function trg_moment_due();

create trigger moment_due_tasks
  after update on tasks for each row execute function trg_moment_due();


-- ============================================================
-- 6. ESTIMATE — fires when estimate (minutes) changes on tasks
-- ============================================================
create or replace function trg_moment_estimate() returns trigger language plpgsql as $$
begin
  if OLD.estimate is distinct from NEW.estimate and NEW.estimate is not null then
    perform insert_moment('tasks', NEW.id, 'estimate', NEW.estimate::text);
  end if;
  return NEW;
end;
$$;

drop trigger if exists moment_estimate_tasks on tasks;

create trigger moment_estimate_tasks
  after update on tasks for each row execute function trg_moment_estimate();


-- ============================================================
-- 7. STARTED — fires on INSERT into task_logs (open range = timer start)
-- ============================================================
create or replace function trg_moment_started() returns trigger language plpgsql as $$
begin
  if upper_inf(NEW.duration) then
    perform insert_moment('tasks', NEW.task_id, 'started', lower(NEW.duration)::text);
  end if;
  return NEW;
end;
$$;

drop trigger if exists moment_started_task_logs on task_logs;

create trigger moment_started_task_logs
  after insert on task_logs for each row execute function trg_moment_started();


-- ============================================================
-- 8. STOPPED — fires on UPDATE of task_logs when upper bound is set
-- ============================================================
create or replace function trg_moment_stopped() returns trigger language plpgsql as $$
begin
  if upper_inf(OLD.duration) and not upper_inf(NEW.duration) then
    perform insert_moment('tasks', NEW.task_id, 'stopped', upper(NEW.duration)::text);
  end if;
  return NEW;
end;
$$;

drop trigger if exists moment_stopped_task_logs on task_logs;

create trigger moment_stopped_task_logs
  after update on task_logs for each row execute function trg_moment_stopped();


-- ============================================================
-- 9. SCHEDULED — fires when an event is created or its duration changes
--    Links back to the task if task_id is set, otherwise the project.
-- ============================================================
create or replace function trg_moment_scheduled() returns trigger language plpgsql as $$
declare
  v_entity_type text;
  v_entity_id   integer;
  v_value       text;
begin
  -- Only care about changes that touch the duration
  if TG_OP = 'INSERT' or (OLD.duration is distinct from NEW.duration) then
    v_value := lower(NEW.duration)::text;

    if NEW.task_id is not null then
      v_entity_type := 'tasks';
      v_entity_id   := NEW.task_id;
    elsif NEW.project_id is not null then
      v_entity_type := 'projects';
      v_entity_id   := NEW.project_id;
    else
      return NEW; -- no entity to attach to
    end if;

    perform insert_moment(v_entity_type, v_entity_id, 'scheduled', v_value);
  end if;
  return NEW;
end;
$$;

drop trigger if exists moment_scheduled_events on events;

create trigger moment_scheduled_events
  after insert or update on events for each row execute function trg_moment_scheduled();
