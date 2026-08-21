-- ============================================================
-- 소망가교 통합 스키마
-- supabase/migrations/20260817050000_content_schema.sql 의 사본입니다.
-- Supabase 대시보드 > SQL Editor에 붙여넣고 그대로 실행하면 됩니다.
--
-- 전제 조건: `profiles` 테이블이 이미 존재해야 합니다
-- (id uuid PK → auth.users, name, avatar_url, gyogyo, phone, role, status,
--  created_at, approved_at). 현재 프로젝트에는 이미 이 테이블과 auth.users
-- 가입 시 자동으로 행을 만들어주는 트리거가 존재하지만, 그 정의가 이
-- 레포의 마이그레이션 이력에는 남아있지 않습니다(다른 경로로 생성됨).
--
-- 참고: supabase/migrations/20260817000000_initial_schema.sql,
-- 20260817010000_scheduled_notifications.sql은 `members` 테이블 기준의
-- 예전 설계라 지금의 `profiles` 기반 앱 코드와 맞지 않습니다(레거시 기록으로만
-- 남아있음). 완전히 새 프로젝트를 처음부터 구성하려면, 먼저 profiles
-- 테이블 + auth.users 가입 트리거를 별도로 만든 뒤 아래 스크립트를
-- 실행하세요.
-- ============================================================

-- ============================================================
-- 콘텐츠 스키마 (profiles 기준)
-- - profiles 테이블은 이미 존재하며(별도 경로로 생성됨: id, name, avatar_url,
--   gyogyo, phone, role, status, created_at, approved_at) 이 마이그레이션에서는
--   손대지 않는다.
-- - 20260817000000_initial_schema.sql이 정의했던 콘텐츠 테이블들을
--   members(id) 대신 profiles(id)를 참조하도록 다시 정의한다.
-- - family_members/생일 관련 테이블은 제외 (앱에서 birth_date를 더 이상
--   쓰지 않고, birthday 카드는 dashboard.ts에서 이미 비활성화됨).
-- 테이블: devotions, devotion_notes, prayer_requests, prayer_reactions,
--        events, songs, daily_songs, sermons, sermon_songs, bible_plans,
--        plan_days, member_plans, reading_logs, push_subscriptions,
--        scheduled_notifications
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUM 타입
-- ============================================================
create type prayer_status as enum ('open', 'praying', 'answered');
create type event_type as enum ('church', 'gagyo', 'birthday', 'other');

-- updated_at 자동 갱신 트리거 함수
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- role/status 기반 관리자 판별 (profiles 기준)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'approved'
  );
$$;

-- ============================================================
-- profiles : RLS 활성화 + 정책 (anon 노출 방지)
-- 승인된 교인은 서로 조회 가능(교인 디렉터리), 본인 행은 상태와 무관하게 조회 가능
-- role/status 변경은 관리자만
-- ============================================================
alter table profiles enable row level security;

drop policy if exists "profiles_select_approved_or_self_or_admin" on profiles;
create policy "profiles_select_approved_or_self_or_admin" on profiles
for select to authenticated
using (status = 'approved' or id = auth.uid() or is_admin());

drop policy if exists "profiles_insert_admin" on profiles;
create policy "profiles_insert_admin" on profiles
for insert to authenticated
with check (is_admin());

drop policy if exists "profiles_update_self_or_admin" on profiles;
create policy "profiles_update_self_or_admin" on profiles
for update to authenticated
using (id = auth.uid() or is_admin())
with check (id = auth.uid() or is_admin());

drop policy if exists "profiles_delete_admin" on profiles;
create policy "profiles_delete_admin" on profiles
for delete to authenticated
using (is_admin());

-- ============================================================
-- 1. devotions : 오늘의 묵상 본문
-- ============================================================
create table devotions (
  id uuid primary key default gen_random_uuid(),
  devotion_date date not null unique,
  tag text,
  title text not null,
  reference text not null,
  verses jsonb not null default '[]'::jsonb, -- [{ "number": 1, "text": "..." }]
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger devotions_set_updated_at
before update on devotions
for each row execute function set_updated_at();

-- ============================================================
-- 2. devotion_notes : 묵상 나눔글
-- ============================================================
create table devotion_notes (
  id uuid primary key default gen_random_uuid(),
  devotion_id uuid not null references devotions (id) on delete cascade,
  member_id uuid not null references profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index devotion_notes_devotion_id_idx on devotion_notes (devotion_id);
create index devotion_notes_member_id_idx on devotion_notes (member_id);

-- ============================================================
-- 3. prayer_requests : 기도제목
-- ============================================================
create table prayer_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references profiles (id) on delete set null,
  display_name text, -- "공동체" 등 표시용 이름 override
  category text,
  content text not null,
  status prayer_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prayer_requests_member_id_idx on prayer_requests (member_id);
create index prayer_requests_status_idx on prayer_requests (status);

create trigger prayer_requests_set_updated_at
before update on prayer_requests
for each row execute function set_updated_at();

-- ============================================================
-- 4. prayer_reactions : "함께 기도해요" 참여 (prayingCount 집계용)
-- ============================================================
create table prayer_reactions (
  id uuid primary key default gen_random_uuid(),
  prayer_request_id uuid not null references prayer_requests (id) on delete cascade,
  member_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (prayer_request_id, member_id)
);

create index prayer_reactions_prayer_request_id_idx on prayer_reactions (prayer_request_id);

-- ============================================================
-- 5. events : 교회 일정 (달력)
-- ============================================================
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  start_time time,
  location text,
  type event_type not null default 'church',
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_event_date_idx on events (event_date);

create trigger events_set_updated_at
before update on events
for each row execute function set_updated_at();

-- ============================================================
-- 6. songs : 찬양 곡 마스터
-- ============================================================
create table songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text,
  cover_image_url text,
  youtube_url text,
  lyrics jsonb not null default '[]'::jsonb, -- [{ "lines": ["..."], "highlighted": false }]
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7. daily_songs : 오늘의 추천 찬양
-- ============================================================
create table daily_songs (
  id uuid primary key default gen_random_uuid(),
  song_id uuid not null references songs (id) on delete cascade,
  song_date date not null unique,
  reason text,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create index daily_songs_song_id_idx on daily_songs (song_id);

-- ============================================================
-- 8. sermons : 설교 (가교모임 설교요약/나눔질문 포함)
-- ============================================================
create table sermons (
  id uuid primary key default gen_random_uuid(),
  category_label text,
  title text not null,
  reference text,
  preacher text,
  sermon_date date not null,
  quote text,
  summary_paragraphs jsonb not null default '[]'::jsonb,
  sharing_questions jsonb not null default '[]'::jsonb, -- [{ "id": 1, "question": "..." }]
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sermons_sermon_date_idx on sermons (sermon_date);

create trigger sermons_set_updated_at
before update on sermons
for each row execute function set_updated_at();

-- ============================================================
-- 9. sermon_songs : 설교(모임)에 연결된 찬양 악보
-- ============================================================
create table sermon_songs (
  id uuid primary key default gen_random_uuid(),
  sermon_id uuid not null references sermons (id) on delete cascade,
  song_id uuid references songs (id) on delete set null,
  musical_key text,
  title text not null,
  sheet_url text,
  display_order int not null default 0
);

create index sermon_songs_sermon_id_idx on sermon_songs (sermon_id);

-- ============================================================
-- 10. bible_plans : 성경통독 플랜 카탈로그
-- ============================================================
create table bible_plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  total_days int not null,
  minutes_per_day text,
  chapters_per_day text,
  difficulty smallint not null default 1 check (difficulty between 1 and 5),
  is_featured boolean not null default false,
  ribbon_label text,
  ribbon_variant text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 11. plan_days : 플랜별 일자 분량
-- ============================================================
create table plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references bible_plans (id) on delete cascade,
  day_number int not null,
  passage text not null,
  duration_label text,
  unique (plan_id, day_number)
);

create index plan_days_plan_id_idx on plan_days (plan_id);

-- ============================================================
-- 12. member_plans : 교인의 플랜 등록/진행 상태
-- ============================================================
create table member_plans (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references profiles (id) on delete cascade,
  plan_id uuid not null references bible_plans (id),
  started_at date not null default current_date,
  current_day int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index member_plans_member_id_idx on member_plans (member_id);
-- 교인당 활성 플랜은 하나만 허용
create unique index member_plans_one_active_per_member on member_plans (member_id) where is_active;

-- ============================================================
-- 13. reading_logs : 일자별 통독 완료 기록
-- ============================================================
create table reading_logs (
  id uuid primary key default gen_random_uuid(),
  member_plan_id uuid not null references member_plans (id) on delete cascade,
  plan_day_id uuid not null references plan_days (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (member_plan_id, plan_day_id)
);

create index reading_logs_member_plan_id_idx on reading_logs (member_plan_id);

-- ============================================================
-- 14. push_subscriptions : 웹 푸시 구독 정보
-- ============================================================
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index push_subscriptions_member_id_idx on push_subscriptions (member_id);

-- ============================================================
-- 15. scheduled_notifications : 예약 발송 웹 푸시 알림
-- ============================================================
create table scheduled_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  url text,
  send_at timestamptz not null,
  sent_at timestamptz,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create index scheduled_notifications_pending_idx
  on scheduled_notifications (send_at)
  where sent_at is null;

-- ============================================================
-- RLS 활성화
-- ============================================================
alter table devotions enable row level security;
alter table devotion_notes enable row level security;
alter table prayer_requests enable row level security;
alter table prayer_reactions enable row level security;
alter table events enable row level security;
alter table songs enable row level security;
alter table daily_songs enable row level security;
alter table sermons enable row level security;
alter table sermon_songs enable row level security;
alter table bible_plans enable row level security;
alter table plan_days enable row level security;
alter table member_plans enable row level security;
alter table reading_logs enable row level security;
alter table push_subscriptions enable row level security;
alter table scheduled_notifications enable row level security;

-- ============================================================
-- RLS 정책 : devotions (공개 콘텐츠, 작성/수정/삭제는 관리자)
-- ============================================================
create policy "devotions_select_all" on devotions
for select to authenticated using (true);

create policy "devotions_admin_write" on devotions
for all to authenticated
using (is_admin())
with check (is_admin());

-- ============================================================
-- RLS 정책 : devotion_notes (전체 공개, 본인 글만 수정/삭제)
-- ============================================================
create policy "devotion_notes_select_all" on devotion_notes
for select to authenticated using (true);

create policy "devotion_notes_insert_own" on devotion_notes
for insert to authenticated
with check (member_id = auth.uid());

create policy "devotion_notes_update_own_or_admin" on devotion_notes
for update to authenticated
using (member_id = auth.uid() or is_admin())
with check (member_id = auth.uid() or is_admin());

create policy "devotion_notes_delete_own_or_admin" on devotion_notes
for delete to authenticated
using (member_id = auth.uid() or is_admin());

-- ============================================================
-- RLS 정책 : prayer_requests (전체 공개, 본인 글만 수정/삭제)
-- ============================================================
create policy "prayer_requests_select_all" on prayer_requests
for select to authenticated using (true);

create policy "prayer_requests_insert_own" on prayer_requests
for insert to authenticated
with check (member_id = auth.uid());

create policy "prayer_requests_update_own_or_admin" on prayer_requests
for update to authenticated
using (member_id = auth.uid() or is_admin())
with check (member_id = auth.uid() or is_admin());

create policy "prayer_requests_delete_own_or_admin" on prayer_requests
for delete to authenticated
using (member_id = auth.uid() or is_admin());

-- ============================================================
-- RLS 정책 : prayer_reactions (전체 공개, 본인 참여만 등록/취소)
-- ============================================================
create policy "prayer_reactions_select_all" on prayer_reactions
for select to authenticated using (true);

create policy "prayer_reactions_insert_own" on prayer_reactions
for insert to authenticated
with check (member_id = auth.uid());

create policy "prayer_reactions_delete_own" on prayer_reactions
for delete to authenticated
using (member_id = auth.uid());

-- ============================================================
-- RLS 정책 : events (공개 콘텐츠, 작성/수정/삭제는 관리자)
-- ============================================================
create policy "events_select_all" on events
for select to authenticated using (true);

create policy "events_admin_write" on events
for all to authenticated
using (is_admin())
with check (is_admin());

-- ============================================================
-- RLS 정책 : songs (공개 콘텐츠, 작성/수정/삭제는 관리자)
-- ============================================================
create policy "songs_select_all" on songs
for select to authenticated using (true);

create policy "songs_admin_write" on songs
for all to authenticated
using (is_admin())
with check (is_admin());

-- ============================================================
-- RLS 정책 : daily_songs (공개 콘텐츠, 작성/수정/삭제는 관리자)
-- ============================================================
create policy "daily_songs_select_all" on daily_songs
for select to authenticated using (true);

create policy "daily_songs_admin_write" on daily_songs
for all to authenticated
using (is_admin())
with check (is_admin());

-- ============================================================
-- RLS 정책 : sermons (공개 콘텐츠, 작성/수정/삭제는 관리자)
-- ============================================================
create policy "sermons_select_all" on sermons
for select to authenticated using (true);

create policy "sermons_admin_write" on sermons
for all to authenticated
using (is_admin())
with check (is_admin());

-- ============================================================
-- RLS 정책 : sermon_songs (공개 콘텐츠, 작성/수정/삭제는 관리자)
-- ============================================================
create policy "sermon_songs_select_all" on sermon_songs
for select to authenticated using (true);

create policy "sermon_songs_admin_write" on sermon_songs
for all to authenticated
using (is_admin())
with check (is_admin());

-- ============================================================
-- RLS 정책 : bible_plans (공개 카탈로그, 작성/수정/삭제는 관리자)
-- ============================================================
create policy "bible_plans_select_all" on bible_plans
for select to authenticated using (true);

create policy "bible_plans_admin_write" on bible_plans
for all to authenticated
using (is_admin())
with check (is_admin());

-- ============================================================
-- RLS 정책 : plan_days (공개 콘텐츠, 작성/수정/삭제는 관리자)
-- ============================================================
create policy "plan_days_select_all" on plan_days
for select to authenticated using (true);

create policy "plan_days_admin_write" on plan_days
for all to authenticated
using (is_admin())
with check (is_admin());

-- ============================================================
-- RLS 정책 : member_plans
-- 완독 현황(예: "32/48명 완독")은 전체 공개, 등록/수정/삭제는 본인 또는 관리자
-- ============================================================
create policy "member_plans_select_all" on member_plans
for select to authenticated using (true);

create policy "member_plans_insert_own" on member_plans
for insert to authenticated
with check (member_id = auth.uid());

create policy "member_plans_update_own_or_admin" on member_plans
for update to authenticated
using (member_id = auth.uid() or is_admin())
with check (member_id = auth.uid() or is_admin());

create policy "member_plans_delete_own_or_admin" on member_plans
for delete to authenticated
using (member_id = auth.uid() or is_admin());

-- ============================================================
-- RLS 정책 : reading_logs
-- 완독 현황 집계를 위해 전체 공개, 기록은 연결된 member_plans의 소유자만
-- ============================================================
create policy "reading_logs_select_all" on reading_logs
for select to authenticated using (true);

create policy "reading_logs_insert_own" on reading_logs
for insert to authenticated
with check (
  exists (
    select 1 from member_plans mp
    where mp.id = member_plan_id and mp.member_id = auth.uid()
  )
);

create policy "reading_logs_delete_own_or_admin" on reading_logs
for delete to authenticated
using (
  is_admin() or exists (
    select 1 from member_plans mp
    where mp.id = member_plan_id and mp.member_id = auth.uid()
  )
);

-- ============================================================
-- RLS 정책 : push_subscriptions (본인 구독 정보만 접근, 발송은 service role 사용)
-- ============================================================
create policy "push_subscriptions_select_own" on push_subscriptions
for select to authenticated
using (member_id = auth.uid());

create policy "push_subscriptions_insert_own" on push_subscriptions
for insert to authenticated
with check (member_id = auth.uid());

create policy "push_subscriptions_update_own" on push_subscriptions
for update to authenticated
using (member_id = auth.uid())
with check (member_id = auth.uid());

create policy "push_subscriptions_delete_own" on push_subscriptions
for delete to authenticated
using (member_id = auth.uid());

-- ============================================================
-- RLS 정책 : scheduled_notifications (관리자만 조회/작성, 발송은 service role 사용)
-- ============================================================
create policy "scheduled_notifications_select_admin" on scheduled_notifications
for select to authenticated using (is_admin());

create policy "scheduled_notifications_write_admin" on scheduled_notifications
for all to authenticated
using (is_admin())
with check (is_admin());

-- ============================================================
-- 16. sermon_drafts : 교회 홈페이지에서 주간 크론으로 스크랩한 설교안 초안 큐
-- (supabase/migrations/20260819000000_sermon_drafts.sql 의 사본)
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
