-- ============================================================
-- 이번주 찬양콘티
-- praise_sets : 주간 찬양콘티 이미지 (찬양 탭 첫 번째 메뉴)
-- 관리자뿐 아니라 승인된 교인이면 누구나 올릴 수 있고,
-- 자기가 올린 사진은 자기가(관리자는 전부) 지울 수 있다.
-- ============================================================

create table praise_sets (
  id uuid primary key default gen_random_uuid(),
  -- 콘티가 쓰이는 주의 시작일(주일). 업로드 시점의 주로 자동 저장된다.
  week_start date not null,
  image_url text not null,
  -- 삭제할 때 스토리지 파일까지 함께 지우기 위해 경로를 남긴다.
  storage_path text not null,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index praise_sets_week_start_idx on praise_sets (week_start desc, created_at);

alter table praise_sets enable row level security;

create policy "praise_sets_select_all" on praise_sets
for select to authenticated using (true);

create policy "praise_sets_insert_own" on praise_sets
for insert to authenticated
with check (created_by = auth.uid());

create policy "praise_sets_delete_own_or_admin" on praise_sets
for delete to authenticated
using (created_by = auth.uid() or is_admin());

-- ============================================================
-- praise-sets 스토리지 버킷 : 찬양콘티 이미지 원본
-- 본인 폴더(자신의 uid 하위)에만 올리고, 본인 또는 관리자가 지울 수 있다.
--
-- 여러 번 실행해도 안전하도록 drop policy if exists 를 함께 쓴다.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('praise-sets', 'praise-sets', true)
on conflict (id) do update set public = true;

drop policy if exists "praise_sets_storage_select_all" on storage.objects;
create policy "praise_sets_storage_select_all" on storage.objects
for select to authenticated using (bucket_id = 'praise-sets');

drop policy if exists "praise_sets_storage_insert_own" on storage.objects;
create policy "praise_sets_storage_insert_own" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'praise-sets'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "praise_sets_storage_delete_own_or_admin" on storage.objects;
create policy "praise_sets_storage_delete_own_or_admin" on storage.objects
for delete to authenticated
using (
  bucket_id = 'praise-sets'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
);
