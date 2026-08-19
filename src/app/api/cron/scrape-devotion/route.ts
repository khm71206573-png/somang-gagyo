import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const DEVOTION_URL = "https://sum.su.or.kr:8888/bible/today";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

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

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let devotionDate: string;
  let title: string;
  let reference: string;
  let verses: Verse[];

  try {
    const response = await fetch(DEVOTION_URL, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `오늘의 묵상 페이지를 불러오지 못했어요. (status ${response.status})` },
        { status: 502 },
      );
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

      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: `필수 항목을 찾지 못했어요: ${missing}`,
      });
    }

    devotionDate = parsedDate;
    title = titleText;
    reference = parsedReference;
    verses = parsedVerses;
  } catch (error) {
    const message = error instanceof Error ? error.message : "오늘의 묵상 스크랩에 실패했어요.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const supabase = createServiceClient();

  const { error: insertError } = await supabase.from("devotions").insert({
    devotion_date: devotionDate,
    tag: "매일성경",
    title,
    reference,
    verses,
    created_by: null,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "already exists for this date",
      });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, inserted: true, devotionDate });
}
