-- ============================================================
-- 예약 발송 웹 푸시 알림
-- 테이블: scheduled_notifications
-- 발송 자체는 Vercel Cron이 호출하는 API Route(서비스 롤 키 사용)가 처리하며,
-- RLS는 관리자의 조회/작성 권한만 규정한다.
-- ============================================================

create table scheduled_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  url text,
  send_at timestamptz not null,
  sent_at timestamptz,
  created_by uuid references members (id),
  created_at timestamptz not null default now()
);

create index scheduled_notifications_pending_idx
  on scheduled_notifications (send_at)
  where sent_at is null;

alter table scheduled_notifications enable row level security;

create policy "scheduled_notifications_select_admin" on scheduled_notifications
for select to authenticated using (is_admin());

create policy "scheduled_notifications_write_admin" on scheduled_notifications
for all to authenticated
using (is_admin())
with check (is_admin());
