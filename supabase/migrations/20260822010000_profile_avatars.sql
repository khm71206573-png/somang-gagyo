-- ============================================================
-- avatars 스토리지 버킷 : 멤버 프로필 사진
-- 본인 폴더(자신의 uid 하위)에만 올리고 지울 수 있고, 조회는 전체 공개.
--
-- 여러 번 실행해도 안전하도록 drop policy if exists 를 함께 쓴다.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop policy if exists "avatars_select_all" on storage.objects;
create policy "avatars_select_all" on storage.objects
for select to authenticated using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects
for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================
-- 본인 프로필 수정 시 role/status/approved_at은 못 바꾸게 막는다.
--
-- profiles_update_self_or_admin RLS는 "using (id = auth.uid() or is_admin())"만
-- 검사한다. RLS는 행 단위 검사라 "어떤 컬럼을 바꾸는지"는 못 막기 때문에,
-- 지금 상태로는 일반 멤버도 자기 행을 직접 PATCH해서 role을 'admin'으로
-- 바꿔치기할 수 있었다 (앱 화면에는 그런 버튼이 없지만, API를 직접 두드리면
-- 가능한 구멍이었다). 트리거로 관리자가 아니면 이 세 컬럼은 바뀌지 못하게
-- 막는다. 관리자가 다른 사람 행을 바꾸는 기존 흐름(승인/거절, 관리자 지정)은
-- is_admin() 체크를 그대로 통과하므로 영향 없다.
-- ============================================================
create or replace function public.guard_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role
      or new.status is distinct from old.status
      or new.approved_at is distinct from old.approved_at then
      raise exception 'role/status/approved_at은 관리자만 바꿀 수 있어요.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_privileged_columns on profiles;
create trigger profiles_guard_privileged_columns
before update on profiles
for each row execute function public.guard_profile_privileged_columns();
