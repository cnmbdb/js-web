create policy "site admins can list media"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'site-media'
  and exists (
    select 1
    from public.site_admins
    where site_admins.user_id = (select auth.uid())
  )
);
