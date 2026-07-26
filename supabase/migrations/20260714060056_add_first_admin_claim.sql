create or replace function public.claim_site_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  lock table public.site_admins in exclusive mode;

  if exists (select 1 from public.site_admins where user_id = current_user_id) then
    return true;
  end if;

  if exists (select 1 from public.site_admins) then
    return false;
  end if;

  insert into public.site_admins (user_id) values (current_user_id);
  return true;
end;
$$;

revoke all on function public.claim_site_admin() from public;
grant execute on function public.claim_site_admin() to authenticated;
