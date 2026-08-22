-- ============================================================
-- 통독 플랜 일시중지
-- member_plans.paused_at : 일시중지를 시작한 날짜 (null이면 진행 중)
--
-- 일시중지 중에는 "오늘 며칠차여야 하는지"를 오늘이 아니라 paused_at 기준으로
-- 계산해 밀린 분량이 쌓이지 않는다. 다시 시작할 때 쉰 날수만큼 started_at을
-- 뒤로 밀어 중단한 지점에서 이어간다.
-- ============================================================

alter table member_plans
  add column if not exists paused_at date;

comment on column member_plans.paused_at is
  '통독 일시중지 시작일. null이면 진행 중.';
