-- ============================================================
-- 공지 수정 권한 + 공지 확인 표시
--
-- 1) 공지는 올린 사람만 고칠 수 있다.
--    지금까지는 관리자면 누구나 남의 공지를 고칠 수 있었다. 화면에서만 막으면
--    API를 직접 두드려 고칠 수 있으므로 RLS에서 작성자(created_by)로 조인다.
--    삭제는 잘못 올라온 공지를 치울 수 있어야 하므로 관리자에게 남겨둔다.
--
-- 2) announcement_reads : "확인했어요" 표시
--    교인이 공지를 읽고 확인 버튼을 누른 기록. 누가 확인했는지와
--    몇 명이 확인했는지를 보여준다.
-- ============================================================

-- ── 1) 공지 수정은 작성자만 ────────────────────────────────
drop policy if exists "announcements_admin_write" on announcements;

create policy "announcements_insert_admin" on announcements
for insert to authenticated
with check (is_admin() and created_by = auth.uid());

-- 작성자 본인만 수정할 수 있고, 수정하면서 작성자를 남으로 바꿀 수도 없다.
create policy "announcements_update_author" on announcements
for update to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

-- 삭제는 작성자와 관리자 모두 가능하다. (잘못 올라온 공지 정리용)
create policy "announcements_delete_author_or_admin" on announcements
for delete to authenticated
using (created_by = auth.uid() or is_admin());

-- 투표 항목도 공지 본문과 같은 사람만 손댈 수 있어야 한다.
-- (공지가 지워질 때는 외래키 cascade로 함께 지워지므로 정책과 무관하다.)
drop policy if exists "announcement_poll_options_admin_write" on announcement_poll_options;

create policy "announcement_poll_options_author_write" on announcement_poll_options
for all to authenticated
using (
  exists (
    select 1 from announcements a
    where a.id = announcement_id and a.created_by = auth.uid()
  )
)
with check (
  exists (
    select 1 from announcements a
    where a.id = announcement_id and a.created_by = auth.uid()
  )
);

-- ── 2) 공지 확인 표시 ──────────────────────────────────────
create table if not exists announcement_reads (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references announcements (id) on delete cascade,
  member_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- 한 사람이 같은 공지를 두 번 확인 표시할 수 없다.
  unique (announcement_id, member_id)
);

comment on table announcement_reads is
  '공지사항 "확인했어요" 표시. 한 사람이 공지마다 한 번씩 남긴다.';

create index if not exists announcement_reads_announcement_id_idx
  on announcement_reads (announcement_id);
create index if not exists announcement_reads_member_id_idx
  on announcement_reads (member_id);

alter table announcement_reads enable row level security;

-- 누가 확인했는지는 모두에게 공개하고, 표시와 취소는 본인만 한다.
create policy "announcement_reads_select_all" on announcement_reads
for select to authenticated using (true);

create policy "announcement_reads_insert_own" on announcement_reads
for insert to authenticated
with check (member_id = auth.uid());

create policy "announcement_reads_delete_own" on announcement_reads
for delete to authenticated
using (member_id = auth.uid());
