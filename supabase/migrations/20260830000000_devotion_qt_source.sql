-- ============================================================
-- 묵상 출처 분리 + 하나님나라QT(사진 OCR) 전용 필드
--
-- 지금까지 devotions는 "하루 한 건"(devotion_date unique)이었지만,
-- 매일성경(자동 스크랩)과 하나님나라QT(관리자가 책을 찍어 OCR)를 같은 날
-- 함께 올려야 해서 (날짜, 출처) 조합으로 유일성을 바꾼다.
--
-- QT 책 지면에는 성경 본문 외에 묵상 해설·기도·실천·각주가 함께 있어서
-- 그만큼의 칼럼을 더한다. 매일성경 행에서는 전부 비어 있다.
-- ============================================================

alter table devotions
  add column if not exists source text not null default 'daily_bible',
  -- 찬송가 317장 (통 353) 내 주 예수 주신 은혜
  add column if not exists hymn text,
  -- [{ "heading": "성경 속의 하나님 나라", "body": "..." }]
  add column if not exists commentary jsonb not null default '[]'::jsonb,
  -- 하나님 나라 구하기(Oratio) / 하나님 나라 살기(Contemplatio)
  add column if not exists prayer text,
  add column if not exists practice text,
  -- [{ "marker": "a", "text": "...", "verse": 2 }]
  add column if not exists footnotes jsonb not null default '[]'::jsonb,
  -- OCR에 쓴 원본 사진. 글자를 잘못 읽었을 때 원본과 대조하는 용도
  add column if not exists image_urls jsonb not null default '[]'::jsonb,
  -- 책 페이지 표기 ("166-167")
  add column if not exists page_label text;

alter table devotions
  drop constraint if exists devotions_source_check;

alter table devotions
  add constraint devotions_source_check
  check (source in ('daily_bible', 'kingdom_qt'));

-- 하루 한 건 → (하루, 출처)당 한 건.
--
-- 날짜에만 걸린 unique를 이름으로 찍어 지우면, 이름이 다를 때 조용히 넘어가고
-- 나중에 QT 등록만 "이미 등록된 묵상이 있어요"로 막힌다. 그래서 이름 대신
-- "devotion_date 한 칼럼짜리 unique 제약"을 카탈로그에서 찾아 지운다.
do $$
declare
  target_name text;
  date_attnum smallint;
begin
  select attnum into date_attnum
  from pg_attribute
  where attrelid = 'public.devotions'::regclass and attname = 'devotion_date';

  select con.conname into target_name
  from pg_constraint con
  where con.conrelid = 'public.devotions'::regclass
    and con.contype = 'u'
    and con.conkey = array[date_attnum];

  if target_name is not null then
    execute format('alter table public.devotions drop constraint %I', target_name);
  end if;
end $$;

create unique index if not exists devotions_date_source_key
  on devotions (devotion_date, source);

-- ============================================================
-- devotion-photos 스토리지 버킷 : QT 책 촬영 원본
-- sheet-music 버킷과 같은 정책(모두 읽기, 관리자만 쓰기/지우기)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('devotion-photos', 'devotion-photos', true)
on conflict (id) do nothing;

drop policy if exists "devotion_photos_select_all" on storage.objects;
create policy "devotion_photos_select_all" on storage.objects
for select to authenticated using (bucket_id = 'devotion-photos');

drop policy if exists "devotion_photos_admin_insert" on storage.objects;
create policy "devotion_photos_admin_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'devotion-photos' and public.is_admin());

drop policy if exists "devotion_photos_admin_delete" on storage.objects;
create policy "devotion_photos_admin_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'devotion-photos' and public.is_admin());
