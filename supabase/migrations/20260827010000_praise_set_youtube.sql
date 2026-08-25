-- ============================================================
-- 찬양콘티에 유튜브 링크 추가
-- 콘티 한 줄은 "사진" 또는 "유튜브 링크" 중 하나다.
-- (사진만 올리던 기존 행은 image_url/storage_path가 그대로 채워져 있다)
-- ============================================================

alter table praise_sets add column if not exists youtube_url text;

alter table praise_sets alter column image_url drop not null;
alter table praise_sets alter column storage_path drop not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'praise_sets_content_required'
  ) then
    alter table praise_sets
      add constraint praise_sets_content_required
      check (image_url is not null or youtube_url is not null);
  end if;
end;
$$;

comment on column praise_sets.youtube_url is
  '유튜브로 올린 콘티. 목록에서는 썸네일과 이동 버튼으로 보여준다.';
