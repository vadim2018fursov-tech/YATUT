do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname='supabase_realtime'
      and schemaname='public'
      and tablename='pulse_feedback'
  ) then
    alter publication supabase_realtime
      add table public.pulse_feedback;
  end if;
end
$$;
