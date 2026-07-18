create table public.article_drafts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  description text not null default '',
  category text not null default '行业观察',
  tags text[] not null default '{}'::text[],
  cover_url text not null default '',
  author text not null default '速芯算力',
  body_mdx text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'failed')),
  featured boolean not null default false,
  published_at date,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id) on delete restrict,
  published_commit_sha text,
  last_error text
);

alter table public.article_drafts enable row level security;

create policy "site admins can read article drafts"
on public.article_drafts
for select
to authenticated
using (
  exists (
    select 1
    from public.site_admins
    where site_admins.user_id = (select auth.uid())
  )
);

create policy "site admins can create article drafts"
on public.article_drafts
for insert
to authenticated
with check (
  updated_by = (select auth.uid())
  and exists (
    select 1
    from public.site_admins
    where site_admins.user_id = (select auth.uid())
  )
);

create policy "site admins can update article drafts"
on public.article_drafts
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
  updated_by = (select auth.uid())
  and exists (
    select 1
    from public.site_admins
    where site_admins.user_id = (select auth.uid())
  )
);

create policy "site admins can delete article drafts"
on public.article_drafts
for delete
to authenticated
using (
  exists (
    select 1
    from public.site_admins
    where site_admins.user_id = (select auth.uid())
  )
);

grant select, insert, update, delete on public.article_drafts to authenticated;
revoke all on public.article_drafts from anon;
