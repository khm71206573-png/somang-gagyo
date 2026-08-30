import { linesToArray, linesToVerses } from "@/lib/adminFormParsing";
import { textToCommentary, textToFootnotes } from "@/lib/devotionQtParsing";
import { DEFAULT_DEVOTION_SOURCE, isDevotionSource } from "@/lib/devotionSource";

/** 관리자 등록·수정 화면이 보내는 묵상 입력값 (모두 입력칸의 문자열 그대로) */
export interface DevotionRequestBody {
  devotionDate?: string;
  source?: string;
  tag?: string;
  title?: string;
  reference?: string;
  verses?: string;
  questions?: string;
  hymn?: string;
  commentary?: string;
  prayer?: string;
  practice?: string;
  footnotes?: string;
  pageLabel?: string;
  imageUrls?: unknown;
}

export interface DevotionColumns {
  devotion_date: string;
  source: string;
  tag: string | null;
  title: string;
  reference: string;
  verses: { number: number; text: string }[];
  questions: { id: number; question: string }[];
  hymn: string | null;
  commentary: { heading: string; body: string }[];
  prayer: string | null;
  practice: string | null;
  footnotes: { marker: string; text: string; verse: number | null }[];
  page_label: string | null;
  image_urls: string[];
}

function trimmedOrNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * 등록·수정 화면의 입력값을 devotions 테이블 칼럼으로 바꾼다.
 * 필수 항목이 비어 있으면 화면에 그대로 보여줄 문구를 반환한다.
 */
export function toDevotionColumns(
  body: DevotionRequestBody | null,
): { error: string } | { columns: DevotionColumns } {
  const devotionDate = body?.devotionDate?.trim();
  const title = body?.title?.trim();
  const reference = body?.reference?.trim();
  const verseLines = linesToArray(body?.verses ?? "");

  if (!devotionDate || !title || !reference || verseLines.length === 0) {
    return { error: "날짜, 제목, 본문 구절, 말씀 내용을 입력해주세요." };
  }

  if (body?.source !== undefined && !isDevotionSource(body.source)) {
    return { error: "묵상 출처가 올바르지 않아요." };
  }

  const imageUrls = Array.isArray(body?.imageUrls)
    ? body.imageUrls.filter((url): url is string => typeof url === "string")
    : [];

  return {
    columns: {
      devotion_date: devotionDate,
      source: body?.source ?? DEFAULT_DEVOTION_SOURCE,
      tag: trimmedOrNull(body?.tag),
      title,
      reference,
      verses: linesToVerses(verseLines),
      questions: linesToArray(body?.questions ?? "").map((question, index) => ({
        id: index + 1,
        question,
      })),
      hymn: trimmedOrNull(body?.hymn),
      commentary: textToCommentary(body?.commentary ?? ""),
      prayer: trimmedOrNull(body?.prayer),
      practice: trimmedOrNull(body?.practice),
      footnotes: textToFootnotes(body?.footnotes ?? ""),
      page_label: trimmedOrNull(body?.pageLabel),
      image_urls: imageUrls,
    },
  };
}
