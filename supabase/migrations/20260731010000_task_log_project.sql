-- A task-less task_log (see the previous migration's `note` column) can
-- still belong to a project even without a task — e.g. hours worked on a
-- job that's tracked as a project but not broken into tasks. project_id
-- gives it that anchor instead of leaving it as free text only.
alter table "public"."task_logs" add column "project_id" uuid references "public"."projects"("id");

comment on column "public"."task_logs"."project_id" is 'Optional project this log belongs to, for a log not tied to a task. Leave null when task_id is set — the task''s project already applies.';
