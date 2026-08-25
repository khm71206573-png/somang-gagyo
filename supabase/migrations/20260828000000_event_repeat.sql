-- ============================================================
-- 일정 반복 설정
-- events.repeat_type  : none(반복 안 함) / daily / weekly / monthly / yearly
-- events.repeat_until : 반복 종료일. null이면 계속 반복한다.
--
-- 반복 일정은 행을 여러 개 만들지 않고 규칙만 저장한다.
-- 달력·홈 화면이 조회 시점에 그 규칙을 펼쳐서 날짜를 계산한다.
-- (event_date는 반복의 기준이 되는 시작일)
-- ============================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'event_repeat_type') then
    create type event_repeat_type as enum ('none', 'daily', 'weekly', 'monthly', 'yearly');
  end if;
end;
$$;

alter table events
  add column if not exists repeat_type event_repeat_type not null default 'none';

alter table events
  add column if not exists repeat_until date;

comment on column events.repeat_type is
  '반복 주기. none이면 event_date 하루짜리 일정.';
comment on column events.repeat_until is
  '반복 종료일. null이면 종료 없이 계속 반복.';

-- 반복 일정은 수가 적어서, 달력 조회 때 이 인덱스로 한 번에 걸러낸다.
create index if not exists events_repeat_type_idx
  on events (repeat_type) where repeat_type <> 'none';
