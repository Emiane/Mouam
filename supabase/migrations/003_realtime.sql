-- Enable live catalogue updates in the public site.
-- Run this once in Supabase SQL Editor if the tables are not already in supabase_realtime.

do $$
declare
	table_name text;
begin
	foreach table_name in array array['services', 'time_slots', 'reviews'] loop
		if not exists (
			select 1
			from pg_publication_tables
			where pubname = 'supabase_realtime'
				and schemaname = 'public'
				and tablename = table_name
		) then
			execute format('alter publication supabase_realtime add table public.%I', table_name);
		end if;
	end loop;
end;
$$;
