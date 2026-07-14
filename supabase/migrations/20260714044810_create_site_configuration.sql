create table public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.site_configs (
  id text primary key,
  config jsonb not null default '{}'::jsonb,
  published_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.site_admins enable row level security;
alter table public.site_configs enable row level security;

create policy "users can read own admin membership"
on public.site_admins
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "published site config is publicly readable"
on public.site_configs
for select
to anon, authenticated
using (true);

create policy "site admins can update published config"
on public.site_configs
for update
to authenticated
using (
  exists (
    select 1
    from public.site_admins
    where site_admins.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.site_admins
    where site_admins.user_id = (select auth.uid())
  )
);

grant select on public.site_configs to anon, authenticated;
grant update (config, published_at, updated_by) on public.site_configs to authenticated;
grant select on public.site_admins to authenticated;

insert into public.site_configs (id, config)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;
