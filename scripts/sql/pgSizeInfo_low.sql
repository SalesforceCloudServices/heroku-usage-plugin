SELECT
   relname AS objectname,
   relkind AS objecttype,
   reltuples AS "#entries", pg_size_pretty(relpages::bigint*8*1024) AS size
   FROM pg_class
   WHERE relpages >= 8
   ORDER BY relpages DESC;

