-- ============================================================
-- 공지사항
-- announcements            : 공지 한 건
--   - kind='post' : 일반 게시글 공지
--   - kind='poll' : 투표 공지 (poll_type='schedule' 일정투표 / 'choice' 문항투표)
-- announcement_poll_options : 투표 항목 (일정투표는 날짜·시각, 문항투표는 문항)
-- announcement_poll_votes   : 교인의 투표 참여
-- announcement_comments     : 공지·투표에 달리는 댓글
-- ============================================================

create type announcement_kind as enum ('post', 'poll');
create type announcement_poll_type as enum ('schedule', 'choice');

create table announcements (
  id uuid primary key default gen_random_uuid(),
  kind announcement_kind not null default 'post',
  -- kind='poll'일 때만 채워진다.
  poll_type announcement_poll_type,
  title text not null,
  content text,
  -- 상단 고정 공지
  is_pinned boolean not null default false,
  -- 복수 선택 허용 여부 (false면 한 항목만 고를 수 있다)
  allow_multiple boolean not null default false,
  -- 투표 마감 시각. null이면 마감 없음.
  closes_at timestamptz,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_poll_type_required
    check (kind = 'post' or poll_type is not null)
);

create index announcements_created_at_idx on announcements (created_at desc);

create trigger announcements_set_updated_at
before update on announcements
for each row execute function set_updated_at();

-- ============================================================
-- announcement_poll_options
-- 일정투표: option_date(+start_time)로 후보 일정을 표시하고 label은 "예배 후" 같은 메모.
-- 문항투표: label이 문항 내용이고 날짜 컬럼은 비어 있다.
-- ============================================================
create table announcement_poll_options (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references announcements (id) on delete cascade,
  label text not null default '',
  option_date date,
  start_time time,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  -- 투표가 항목의 공지와 어긋나지 않도록 복합 외래키의 참조 대상이 된다.
  unique (id, announcement_id)
);

create index announcement_poll_options_announcement_id_idx
  on announcement_poll_options (announcement_id, display_order);

-- ============================================================
-- announcement_poll_votes
-- ============================================================
create table announcement_poll_votes (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references announcements (id) on delete cascade,
  option_id uuid not null references announcement_poll_options (id) on delete cascade,
  member_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (option_id, member_id),
  -- option_id가 announcement_id와 같은 공지에 속한 항목인지 DB에서 보장한다.
  foreign key (option_id, announcement_id)
    references announcement_poll_options (id, announcement_id) on delete cascade
);

create index announcement_poll_votes_announcement_id_idx
  on announcement_poll_votes (announcement_id);
create index announcement_poll_votes_member_id_idx
  on announcement_poll_votes (member_id);

-- 복수 선택을 허용하지 않는 투표에서 두 항목 이상 고르지 못하게 막는다.
create or replace function public.enforce_announcement_single_vote()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.announcements a
    where a.id = new.announcement_id and not a.allow_multiple
  ) and exists (
    select 1 from public.announcement_poll_votes v
    where v.announcement_id = new.announcement_id
      and v.member_id = new.member_id
      and v.option_id <> new.option_id
  ) then
    raise exception '이 투표는 한 항목만 선택할 수 있어요.';
  end if;

  return new;
end;
$$;

create trigger announcement_poll_votes_single_choice
before insert on announcement_poll_votes
for each row execute function enforce_announcement_single_vote();

-- ============================================================
-- announcement_comments
-- ============================================================
create table announcement_comments (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references announcements (id) on delete cascade,
  member_id uuid not null references profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index announcement_comments_announcement_id_idx
  on announcement_comments (announcement_id, created_at);

-- ============================================================
-- RLS
-- ============================================================
alter table announcements enable row level security;
alter table announcement_poll_options enable row level security;
alter table announcement_poll_votes enable row level security;
alter table announcement_comments enable row level security;

-- 공지 본문·투표 항목: 전체 열람, 작성·수정·삭제는 관리자
create policy "announcements_select_all" on announcements
for select to authenticated using (true);

create policy "announcements_admin_write" on announcements
for all to authenticated
using (is_admin())
with check (is_admin());

create policy "announcement_poll_options_select_all" on announcement_poll_options
for select to authenticated using (true);

create policy "announcement_poll_options_admin_write" on announcement_poll_options
for all to authenticated
using (is_admin())
with check (is_admin());

-- 투표 참여: 결과는 전체 공개, 참여·취소는 본인만 그리고 마감 전에만
create policy "announcement_poll_votes_select_all" on announcement_poll_votes
for select to authenticated using (true);

create policy "announcement_poll_votes_insert_own" on announcement_poll_votes
for insert to authenticated
with check (
  member_id = auth.uid()
  and exists (
    select 1 from announcements a
    where a.id = announcement_id
      and a.kind = 'poll'
      and (a.closes_at is null or a.closes_at > now())
  )
);

create policy "announcement_poll_votes_delete_own" on announcement_poll_votes
for delete to authenticated
using (
  is_admin()
  or (
    member_id = auth.uid()
    and exists (
      select 1 from announcements a
      where a.id = announcement_id
        and (a.closes_at is null or a.closes_at > now())
    )
  )
);

-- 댓글: 전체 공개, 본인 글만 수정/삭제 (관리자는 전체 삭제 가능)
create policy "announcement_comments_select_all" on announcement_comments
for select to authenticated using (true);

create policy "announcement_comments_insert_own" on announcement_comments
for insert to authenticated
with check (member_id = auth.uid());

create policy "announcement_comments_update_own" on announcement_comments
for update to authenticated
using (member_id = auth.uid())
with check (member_id = auth.uid());

create policy "announcement_comments_delete_own_or_admin" on announcement_comments
for delete to authenticated
using (member_id = auth.uid() or is_admin());
