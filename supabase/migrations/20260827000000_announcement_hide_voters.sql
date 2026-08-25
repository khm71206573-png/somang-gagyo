-- ============================================================
-- 투표자 이름 비공개
-- announcements.hide_voters : true면 누가 무엇을 골랐는지 감추고
-- 참여 인원과 항목별 득표 수만 보여준다.
--
-- 화면에서만 가리면 API를 직접 두드려 이름을 볼 수 있으므로,
-- 이름을 감춘 투표에서는 남의 투표 행 자체를 못 읽게 RLS를 조인다.
-- 대신 집계는 정확해야 해서 RLS를 타지 않는 집계 뷰를 따로 둔다.
-- ============================================================

alter table announcements
  add column if not exists hide_voters boolean not null default false;

comment on column announcements.hide_voters is
  '투표자 이름을 감출지. true면 참여 인원·득표 수만 보여준다.';

-- ── 투표 행 조회 범위 좁히기 ────────────────────────────────
drop policy if exists "announcement_poll_votes_select_all" on announcement_poll_votes;
drop policy if exists "announcement_poll_votes_select_visible" on announcement_poll_votes;
create policy "announcement_poll_votes_select_visible" on announcement_poll_votes
for select to authenticated
using (
  -- 내 표는 언제나 보인다 (내가 무엇을 골랐는지 화면에 표시해야 한다)
  member_id = auth.uid()
  or exists (
    select 1 from announcements a
    where a.id = announcement_id and not a.hide_voters
  )
);

-- 관리자도 이름은 못 본다(비공개는 비공개여야 한다). 투표 정리(삭제)는
-- announcement_poll_votes_delete_own 정책이 이미 관리자에게 열어두고 있고,
-- 집계는 아래 뷰로 가져오므로 운영에 필요한 기능은 그대로 동작한다.

-- ── 집계 뷰 (security_invoker = off → 뷰 소유자 권한으로 집계) ──
create or replace view announcement_poll_option_counts
with (security_invoker = off) as
select
  o.announcement_id,
  o.id as option_id,
  count(v.id)::int as vote_count
from announcement_poll_options o
left join announcement_poll_votes v on v.option_id = o.id
group by o.announcement_id, o.id;

create or replace view announcement_voter_counts
with (security_invoker = off) as
select
  announcement_id,
  count(distinct member_id)::int as voter_count
from announcement_poll_votes
group by announcement_id;

grant select on announcement_poll_option_counts to authenticated;
grant select on announcement_voter_counts to authenticated;
