-- 일정 분류에 "가교일정"을 추가한다.
-- 기존: church(교회일정) / birthday(생일) / other(기타)
-- 추가: gagyo(가교일정)
--
-- NOTE: PostgreSQL 12+ 에서는 트랜잭션 안에서 ALTER TYPE ... ADD VALUE 가 가능하다.
-- 다만 같은 트랜잭션에서 새 값을 사용할 수는 없으므로 값 추가만 수행한다.
alter type event_type add value if not exists 'gagyo';
