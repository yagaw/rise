-- qle_ease RLS policies for client-key based app access
-- Run in Supabase SQL Editor

alter table public.qle_ease enable row level security;

-- Optional cleanup if policies already exist
-- drop policy if exists "qle_ease_select_client" on public.qle_ease;
-- drop policy if exists "qle_ease_insert_client" on public.qle_ease;
-- drop policy if exists "qle_ease_update_client" on public.qle_ease;
-- drop policy if exists "qle_ease_delete_client" on public.qle_ease;

create policy "qle_ease_select_client"
on public.qle_ease
for select
to anon, authenticated
using (true);

create policy "qle_ease_insert_client"
on public.qle_ease
for insert
to anon, authenticated
with check (true);

create policy "qle_ease_update_client"
on public.qle_ease
for update
to anon, authenticated
using (true)
with check (true);

create policy "qle_ease_delete_client"
on public.qle_ease
for delete
to anon, authenticated
using (true);
