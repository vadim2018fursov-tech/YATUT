alter table public.profiles
  add column if not exists founder boolean not null default false,
  add column if not exists early_user boolean not null default true;

update public.profiles
set founder = true,
    early_user = true
where founder = false
  and created_at = (
    select min(created_at)
    from public.profiles
  );
