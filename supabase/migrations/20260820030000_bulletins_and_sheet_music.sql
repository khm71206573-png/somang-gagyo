-- ============================================================
-- bulletins : 주보 (교제 탭에 표시할 주간 주보 이미지)
-- ============================================================
create table bulletins (
  id uuid primary key default gen_random_uuid(),
  bulletin_date date not null unique,
  image_urls jsonb not null default '[]'::jsonb,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create index bulletins_bulletin_date_idx on bulletins (bulletin_date);

alter table bulletins enable row level security;

create policy "bulletins_select_all" on bulletins
for select to authenticated using (true);

create policy "bulletins_admin_write" on bulletins
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================
-- sheet-music 스토리지 버킷 : 찬양악보 이미지를 교제 탭에서 바로 업로드/삭제
-- ============================================================
insert into storage.buckets (id, name, public)
values ('sheet-music', 'sheet-music', true)
on conflict (id) do nothing;

create policy "sheet_music_select_all" on storage.objects
for select to authenticated using (bucket_id = 'sheet-music');

create policy "sheet_music_admin_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'sheet-music' and public.is_admin());

create policy "sheet_music_admin_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'sheet-music' and public.is_admin());
