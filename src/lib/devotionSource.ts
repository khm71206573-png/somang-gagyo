/**
 * 묵상 출처. 같은 날짜에 출처별로 한 건씩 올라간다.
 * - daily_bible : 매일성경 웹페이지를 새벽 cron이 자동으로 스크랩한 것
 * - kingdom_qt  : 하나님나라QT 책 지면을 관리자가 찍어 OCR로 올린 것
 */
export const DEVOTION_SOURCES = ["daily_bible", "kingdom_qt"] as const;

export type DevotionSource = (typeof DEVOTION_SOURCES)[number];

export const DEFAULT_DEVOTION_SOURCE: DevotionSource = "daily_bible";

/**
 * 한 곳에 하나만 보여줘야 할 때(홈 카드, 묵상 탭 첫 진입) 고르는 순서.
 * 매일성경은 매일 자동으로 올라오니 기본으로 두고, QT는 탭에서 고른다.
 */
export const DEVOTION_SOURCE_PREFERENCE: DevotionSource[] = [
  "daily_bible",
  "kingdom_qt",
];

export const devotionSourceLabels: Record<DevotionSource, string> = {
  daily_bible: "매일성경",
  kingdom_qt: "하나님나라QT",
};

export function isDevotionSource(value: unknown): value is DevotionSource {
  return (
    typeof value === "string" &&
    (DEVOTION_SOURCES as readonly string[]).includes(value)
  );
}

/** DB에서 읽은 값이 비었거나 이상하면 매일성경으로 본다. */
export function toDevotionSource(value: unknown): DevotionSource {
  return isDevotionSource(value) ? value : DEFAULT_DEVOTION_SOURCE;
}
