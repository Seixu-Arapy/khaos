-- Lets a task_log stand on its own, unattached to any task: hours worked on
-- a job that isn't modeled as a task (a client, a gig, ad-hoc paid work)
-- still deserve tracking, and task_id was already nullable for exactly this
-- case — it just had no way to say *what* the untracked hours were for.
--
-- `note` fills that gap. Free text rather than a new `jobs` table: this is
-- for incidental work outside the field/project/section/task hierarchy, not
-- something that needs its own structured entity.
alter table "public"."task_logs" add column "note" text;

comment on column "public"."task_logs"."note" is
    'Free-text description of the work, for a log not tied to a task (e.g. hours worked on a job or client outside the task hierarchy). Leave null when task_id is set — the task already describes the work.';
