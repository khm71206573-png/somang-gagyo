-- ============================================================
-- devotions.questions : 묵상 질문 (sermons.sharing_questions와 동일한 패턴)
-- [{ "id": 1, "question": "..." }]
-- ============================================================
alter table devotions
  add column questions jsonb not null default '[]'::jsonb;
