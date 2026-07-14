revoke execute on function public.claim_site_admin() from anon;
revoke execute on function public.claim_site_admin() from public;
grant execute on function public.claim_site_admin() to authenticated;

create index site_configs_updated_by_idx
on public.site_configs (updated_by);
