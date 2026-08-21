-- ============================================================
-- reading_cheers : 통독 응원 보내기 기록
-- 같은 플랜을 읽는 사람들에게 하루 한 번 응원을 보낼 수 있다.
-- 보낸 기록을 남겨서 오늘 몇 명이 응원했는지 보여주고 중복 발송을 막는다.
-- ============================================================
create table reading_cheers (
  id uuid primary key default gen_random_uuid(),
  from_member_id uuid not null references profiles (id) on delete cascade,
  plan_id uuid not null references bible_plans (id) on delete cascade,
  cheer_date date not null default current_date,
  created_at timestamptz not null default now(),
  -- 하루 한 번만 보낼 수 있게 제한
  unique (from_member_id, cheer_date)
);

create index reading_cheers_plan_date_idx on reading_cheers (plan_id, cheer_date);

alter table reading_cheers enable row level security;

-- 응원 현황 집계를 위해 조회는 전체 공개, 기록은 본인만
create policy "reading_cheers_select_all" on reading_cheers
for select to authenticated using (true);

create policy "reading_cheers_insert_own" on reading_cheers
for insert to authenticated
with check (from_member_id = auth.uid());

create policy "reading_cheers_delete_own_or_admin" on reading_cheers
for delete to authenticated
using (public.is_admin() or from_member_id = auth.uid());
