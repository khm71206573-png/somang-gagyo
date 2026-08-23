-- ============================================================
-- 통독 플랜 여러 개 동시 진행
--
-- 기존에는 "교인당 활성 플랜 하나"만 허용하는 부분 유니크 인덱스가 있어
-- 새 플랜을 시작하면 이전 플랜을 비활성으로 내려야 했다.
-- 이제 여러 플랜을 동시에 진행할 수 있게 그 제약을 풀고, 대신 같은 플랜을
-- 두 번 등록하지 못하도록 (member_id, plan_id) 기준으로 다시 건다.
-- ============================================================

drop index if exists member_plans_one_active_per_member;

create unique index if not exists member_plans_one_active_row_per_plan
  on member_plans (member_id, plan_id)
  where is_active;
