-- ============================================================
-- sermon_drafts : 교회 홈페이지에서 주간 크론으로 스크랩한 설교안 초안 큐
-- 관리자가 이 초안을 참고해 sermons 테이블에 실제 등록한다.
-- ============================================================
create table sermon_drafts (
  id uuid primary key default gen_random_uuid(),
  source_wr_id integer not null unique,
  source_url text not null,
  title text not null,
  sermon_date date not null,
  image_urls jsonb not null default '[]'::jsonb,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index sermon_drafts_consumed_at_idx on sermon_drafts (consumed_at);

alter table sermon_drafts enable row level security;

create policy "sermon_drafts_admin_all" on sermon_drafts
for all to authenticated
using (is_admin())
with check (is_admin());
