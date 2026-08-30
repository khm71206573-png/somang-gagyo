import * as cheerio from "cheerio";
import { createServiceClient } from "@/lib/supabase/service";
import { HttpError } from "./HttpError";
import { defaultDevotionQuestions } from "@/lib/devotionQuestions";

const DEVOTION_URL = "https://sum.su.or.kr:8888/bible/today";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function parseDevotionDate(text: string): string | null {
  const match = text.match(/(\d{4})\.(\d{2})\.(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  return `${year}-${month}-${day}`;
}

function parseReference(text: string): string | null {
  const withoutPrefix = text.replace(/^본문\s*:\s*/, "").trim();
  const [reference] = withoutPrefix.split("찬송가");
  const trimmed = reference?.trim();
  return trimmed ? trimmed : null;
}

interface Verse {
  number: number;
  text: string;
}

export interface ParsedDevotion {
  devotionDate: string;
  title: string;
  reference: string;
  verses: Verse[];
}

export type ParseDevotionResult =
  | ({ ok: true; skipped: false } & ParsedDevotion)
  | { ok: true; skipped: true; reason: string };

/**
 * "오늘의 묵상" 페이지를 스크랩해 파싱 결과만 반환한다 (DB에 쓰지 않음).
 * 관리자 등록 화면에서 입력칸을 자동으로 채우는 용도.
 *
 * fetch/파싱 실패는 HttpError(502)를 throw한다. 필수 항목 누락은 skipped를 반환한다.
 */
export async function parseTodayDevotion(): Promise<ParseDevotionResult> {
  try {
    const response = await fetch(DEVOTION_URL, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) {
      throw new HttpError(`오늘의 묵상 페이지를 불러오지 못했어요. (status ${response.status})`, 502);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const dateText = $("#dailybible_info").text().trim();
    const titleText = $("#bible_text").text().trim();
    const referenceText = $("#bibleinfo_box").text().trim();

    const parsedDate = parseDevotionDate(dateText);
    const parsedReference = parseReference(referenceText);

    const parsedVerses: Verse[] = $("#body_list li")
      .map((_, el) => {
        const $li = $(el);
        const number = Number.parseInt($li.find(".num").text().trim(), 10);
        const text = $li.find(".info").text().trim();
        return { number, text };
      })
      .get()
      .filter((verse) => Number.isFinite(verse.number) && verse.text.length > 0);

    if (!parsedDate || !titleText || !parsedReference || parsedVerses.length === 0) {
      const missing = [
        !parsedDate && "date",
        !titleText && "title",
        !parsedReference && "reference",
        parsedVerses.length === 0 && "verses",
      ]
        .filter(Boolean)
        .join(", ");

      return {
        ok: true,
        skipped: true,
        reason: `필수 항목을 찾지 못했어요: ${missing}`,
      };
    }

    return {
      ok: true,
      skipped: false,
      devotionDate: parsedDate,
      title: titleText,
      reference: parsedReference,
      verses: parsedVerses,
    };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    const message = error instanceof Error ? error.message : "오늘의 묵상 스크랩에 실패했어요.";
    throw new HttpError(message, 502);
  }
}

export type ScrapeDevotionResult =
  | { ok: true; inserted: true; devotionDate: string }
  | { ok: true; skipped: true; reason: string };

/**
 * "오늘의 묵상" 페이지를 스크랩해 devotions 테이블에 저장한다.
 * 묵상 질문은 AI로 만들지 않고 고정된 기본 질문으로 넣는다. 본문에 맞춘 질문이
 * 필요하면 관리자 화면에서 직접 "AI로 질문 만들기"를 눌러 덮어쓴다.
 * Cron·관리자 수동 실행 버튼 양쪽에서 동일한 스크랩 로직을 쓰기 위한 공용 함수.
 *
 * fetch/파싱 실패는 Error를 throw한다 (호출부에서 502로 매핑).
 * 필수 항목 누락, 중복(23505)은 throw하지 않고 skipped 결과를 반환한다.
 * 그 외 DB insert 오류는 Error를 throw한다 (호출부에서 500으로 매핑).
 */
export async function scrapeDevotion(): Promise<ScrapeDevotionResult> {
  const parsed = await parseTodayDevotion();

  if (parsed.skipped) {
    return parsed;
  }

  const { devotionDate, title, reference, verses } = parsed;

  // 매일 같은 기본 질문으로 묵상한다. 본문에 맞춘 질문이 필요하면
  // 관리자 화면의 "AI로 질문 만들기"로 따로 덮어쓸 수 있다.
  const questions = defaultDevotionQuestions();

  const supabase = createServiceClient();

  const { error: insertError } = await supabase.from("devotions").insert({
    devotion_date: devotionDate,
    source: "daily_bible",
    tag: "매일성경",
    title,
    reference,
    verses,
    questions,
    created_by: null,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        ok: true,
        skipped: true,
        reason: "already exists for this date",
      };
    }
    throw new HttpError(insertError.message, 500);
  }

  return { ok: true, inserted: true, devotionDate };
}
