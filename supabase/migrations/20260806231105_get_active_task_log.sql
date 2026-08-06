CREATE OR REPLACE FUNCTION "public"."get_active_task_log"() RETURNS SETOF "public"."task_logs"
    LANGUAGE "sql" STABLE
    AS $$
  SELECT * FROM task_logs WHERE upper_inf(duration) = true LIMIT 1;
$$;

ALTER FUNCTION "public"."get_active_task_log"() OWNER TO "postgres";
