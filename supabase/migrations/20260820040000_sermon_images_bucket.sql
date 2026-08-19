-- ============================================================
-- sermon-images 스토리지 버킷 : 설교안/주보 스크랩·등록 이미지를 우리 쪽에
-- 재호스팅하기 위한 버킷. 원본 교회 홈페이지가 HTTPS를 지원하지 않아
-- (http만 지원, https 요청은 http로 리다이렉트) 브라우저에서 혼합 콘텐츠로
-- 차단되는 문제를 피하기 위해 스크랩 시점에 다운로드 후 이 버킷에 업로드한다.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('sermon-images', 'sermon-images', true)
on conflict (id) do nothing;

create policy "sermon_images_select_all" on storage.objects
for select to authenticated using (bucket_id = 'sermon-images');

create policy "sermon_images_admin_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'sermon-images' and public.is_admin());

create policy "sermon_images_admin_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'sermon-images' and public.is_admin());
