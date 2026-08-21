/**
 * 매일 묵상에 공통으로 쓰는 기본 질문.
 *
 * 날마다 다른 질문을 만들어 내기보다, 같은 질문을 반복해서 묵상하는 편이
 * 성도들이 답을 쌓아가며 흐름을 보기 좋다는 판단에 따라 고정 질문을 쓴다.
 */
export const DEFAULT_DEVOTION_QUESTIONS = [
  "오늘 말씀에서 하나님은 어떤 분인가요?",
  "오늘 말씀 중에 마음에 와닿은 단어나 구절이 있었는지 이유와 함께 적어주세요.",
  "오늘 말씀에 비추어, 이번 한 주 삶에서 하나님께 순종하고 싶은 것은 무엇인가요?",
] as const;

export function defaultDevotionQuestions() {
  return DEFAULT_DEVOTION_QUESTIONS.map((question, index) => ({
    id: index + 1,
    question,
  }));
}
