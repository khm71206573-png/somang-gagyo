-- ============================================================
-- 매일성경 묵상 제거
--
-- 묵상은 하나님나라QT 하나만 쓰기로 해서, 자동 스크랩과 함께
-- 그동안 쌓인 매일성경 묵상 행을 지운다.
--
-- ⚠️ 되돌릴 수 없다. devotion_notes가 devotions를 on delete cascade로
--    참조하므로, 성도들이 그 묵상에 남긴 나눔글도 함께 사라진다.
--    실행 전에 아래 쿼리로 몇 건이 지워지는지 먼저 확인할 것.
--
--    select
--      (select count(*) from devotions where source = 'daily_bible') as 묵상,
--      (select count(*) from devotion_notes n
--         join devotions d on d.id = n.devotion_id
--        where d.source = 'daily_bible') as 함께_지워질_나눔글;
-- ============================================================

delete from devotions where source = 'daily_bible';

-- 새로 들어오는 묵상은 QT다. 앱도 저장할 때 값을 직접 넣지만,
-- 기본값이 옛 출처로 남아 있으면 나중에 헷갈린다.
alter table devotions alter column source set default 'kingdom_qt';

-- source의 허용값(daily_bible, kingdom_qt)은 그대로 둔다.
-- 나중에 다른 출처를 다시 붙일 때 제약을 손대지 않아도 되게 하려는 것.
