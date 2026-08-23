-- ============================================================
-- 감사기도 표시
-- prayer_requests.is_thanksgiving : 감사기도로 올린 글인지
--
-- 기도제목 나누기에서 "감사기도예요"를 체크하면 true로 저장되고,
-- 목록에서 "감사" 배지가 따로 붙는다.
-- ============================================================

alter table prayer_requests
  add column if not exists is_thanksgiving boolean not null default false;

comment on column prayer_requests.is_thanksgiving is
  '감사기도로 올린 글이면 true.';
