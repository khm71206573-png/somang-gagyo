-- ============================================================
-- 성경통독 샘플 플랜 시드 데이터
-- bible_plans/plan_days 테이블은 스키마만 있고 실제 데이터가 없어
-- /bible-plan-select, /bible-progress가 항상 빈 상태였다.
-- 마가복음(16장)을 하루 1장씩 읽는 플랜을 시드로 채워 동작을 확인한다.
-- ============================================================

with new_plan as (
  insert into bible_plans (
    title, description, total_days, minutes_per_day, chapters_per_day,
    difficulty, is_featured, ribbon_label, ribbon_variant
  )
  values (
    '마가복음 16일 통독',
    '예수님의 생애를 가장 빠르게 훑는 마가복음, 하루 한 장씩',
    16,
    '하루 약 5분',
    '하루 1장',
    1,
    true,
    '처음이라면',
    'secondary-container'
  )
  returning id
)
insert into plan_days (plan_id, day_number, passage, duration_label)
select new_plan.id, day_number, '마가복음 ' || day_number || '장', '5분'
from new_plan, generate_series(1, 16) as day_number;
