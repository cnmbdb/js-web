revoke all on table public.article_drafts from anon, authenticated;
grant select, insert, update, delete on table public.article_drafts to authenticated;

create index if not exists article_drafts_updated_by_idx
on public.article_drafts (updated_by);
