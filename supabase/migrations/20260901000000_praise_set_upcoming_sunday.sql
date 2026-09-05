-- ============================================================
-- 찬양콘티 기준일을 "다가오는 주일"로 맞춘다.
--
-- 콘티는 주일 전(보통 금요일)에 올라온다. 예전에는 올린 날이 속한 주의
-- 시작일(지난 주일)로 저장돼서, 금요일에 올린 콘티가 정작 그 콘티를 쓰는
-- 주일 날짜와 한 주 어긋나 보였다.
--
-- 이미 쌓인 행도 올린 시각(한국 시간) 기준으로 다가오는 주일로 옮긴다.
-- 주일에 올린 콘티는 그날이 그대로 기준일이라 값이 바뀌지 않는다.
-- ============================================================

update praise_sets
set week_start =
  (created_at at time zone 'Asia/Seoul')::date
  + ((7 - extract(dow from (created_at at time zone 'Asia/Seoul'))::int) % 7)
where week_start <> (
  (created_at at time zone 'Asia/Seoul')::date
  + ((7 - extract(dow from (created_at at time zone 'Asia/Seoul'))::int) % 7)
);

comment on column praise_sets.week_start is
  '콘티를 쓰는 주일(일요일) 날짜. 올린 시점 기준 다가오는 주일로 저장된다.';
