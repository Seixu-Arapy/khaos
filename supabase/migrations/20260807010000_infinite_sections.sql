-- Infinite sections: an opt-in section mode for ongoing, never-ending lists
-- (recurring chores, someday/maybe, inbox-style buckets). Done/cancelled
-- tasks inside an infinite section are meant to fade and eventually hide in
-- the UI based on how long ago they settled, using the existing
-- moment_status_tasks moments trail (no new per-task timestamp needed).

ALTER TABLE "public"."sections"
  ADD COLUMN "is_infinite" boolean DEFAULT false NOT NULL;

COMMENT ON COLUMN "public"."sections"."is_infinite" IS 'When true, this section represents an ongoing/never-ending list rather than a bounded chapter. Done/cancelled tasks within it are expected to fade and eventually hide client-side as they age, instead of accumulating indefinitely.';
