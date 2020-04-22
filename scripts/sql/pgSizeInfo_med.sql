SELECT
    relname as "table",
    pg_size_pretty(pg_total_relation_size(relid)) As "size",
    pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as "externalSize"
    FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC;

