-- ============================================================
-- prayer_likes : 기도제목 좋아요(하트)
--
-- prayer_reactions("함께 기도하기")와는 별개다.
-- 기도에 함께하는 것과, 글에 마음을 표현하는 것을 따로 세기 위해 테이블을 나눈다.
-- ============================================================
create table if not exists prayer_likes (
  id uuid primary key default gen_random_uuid(),
  prayer_request_id uuid not null references prayer_requests (id) on delete cascade,
  member_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- 한 사람이 같은 기도제목에 하트를 두 번 누를 수 없다.
  unique (prayer_request_id, member_id)
);

comment on table prayer_likes is
  '기도제목 좋아요(하트). 한 사람이 기도제목마다 한 번씩 누른다.';

create index if not exists prayer_likes_prayer_request_id_idx
  on prayer_likes (prayer_request_id);
create index if not exists prayer_likes_member_id_idx
  on prayer_likes (member_id);

alter table prayer_likes enable row level security;

-- 좋아요 수는 모두에게 공개하고, 누르고 취소하는 건 본인만 한다.
create policy "prayer_likes_select_all" on prayer_likes
for select to authenticated using (true);

create policy "prayer_likes_insert_own" on prayer_likes
for insert to authenticated
with check (member_id = auth.uid());

create policy "prayer_likes_delete_own" on prayer_likes
for delete to authenticated
using (member_id = auth.uid());
