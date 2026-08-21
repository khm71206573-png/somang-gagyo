-- ============================================================
-- sermon_summaries : 설교요약 게시물
-- 제목 없이 본문만 올리는 단순 게시물. 매주 새로 올려도 이전 글이
-- 지워지지 않고 최신순으로 계속 쌓인다.
--
-- 여러 번 실행해도 안전하도록 if not exists / drop if exists 를 쓴다.
-- (일부만 적용된 상태에서 다시 실행해도 중간에 멈추지 않게 하기 위함)
-- ============================================================
create table if not exists sermon_summaries (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists sermon_summaries_created_at_idx
  on sermon_summaries (created_at desc);

alter table sermon_summaries enable row level security;

drop policy if exists "sermon_summaries_select_all" on sermon_summaries;
create policy "sermon_summaries_select_all" on sermon_summaries
for select to authenticated using (true);

drop policy if exists "sermon_summaries_admin_write" on sermon_summaries;
create policy "sermon_summaries_admin_write" on sermon_summaries
for all to authenticated
using (public.is_admin())
with check (public.is_admin());
