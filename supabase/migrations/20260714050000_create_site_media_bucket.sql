insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'site-media',
  'site-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "site admins can upload media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and exists (
    select 1
    from public.site_admins
    where site_admins.user_id = (select auth.uid())
  )
);

create policy "site admins can update media"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-media'
  and exists (
    select 1
    from public.site_admins
    where site_admins.user_id = (select auth.uid())
  )
)
with check (
  bucket_id = 'site-media'
  and exists (
    select 1
    from public.site_admins
    where site_admins.user_id = (select auth.uid())
  )
);

create policy "site admins can delete media"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-media'
  and exists (
    select 1
    from public.site_admins
    where site_admins.user_id = (select auth.uid())
  )
);
