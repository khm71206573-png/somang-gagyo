import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const BOARD_LIST_URL =
  "http://nadulmokheaven.org/bbs/board.php?bo_table=board1";
const BOARD_DETAIL_URL =
  "http://nadulmokheaven.org/bbs/board.php?bo_table=board1&wr_id=";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function extractWrId(href: string): number | null {
  try {
    const url = new URL(href);
    const wrId = url.searchParams.get("wr_id");
    return wrId ? Number.parseInt(wrId, 10) : null;
  } catch {
    return null;
  }
}

function parseSermonDate(title: string): string | null {
  const match = title.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (!match) return null;
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let wrId: number;
  let title: string;

  try {
    const listResponse = await fetch(BOARD_LIST_URL, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!listResponse.ok) {
      return NextResponse.json(
        { error: `게시판 목록을 불러오지 못했어요. (status ${listResponse.status})` },
        { status: 502 },
      );
    }

    const listHtml = await listResponse.text();
    const $list = cheerio.load(listHtml);

    let foundWrId: number | null = null;
    let foundTitle: string | null = null;

    $list("tbody tr").each((_, row) => {
      if (foundWrId !== null) return;

      const $row = $list(row);
      if ($row.hasClass("bo_notice")) return;

      const $link = $row.find("td.td_subject a").first();
      const linkText = $link.text().trim();
      if (!linkText.includes("설교안")) return;

      const href = $link.attr("href");
      if (!href) return;

      const parsedWrId = extractWrId(href);
      if (parsedWrId === null) return;

      foundWrId = parsedWrId;
      foundTitle = linkText;
    });

    if (foundWrId === null || foundTitle === null) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "설교안 게시글을 찾지 못했어요.",
      });
    }

    wrId = foundWrId;
    title = foundTitle;
  } catch (error) {
    const message = error instanceof Error ? error.message : "게시판 목록 스크랩에 실패했어요.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const sermonDate = parseSermonDate(title);
  if (!sermonDate) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "date not found in title",
    });
  }

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("sermon_drafts")
    .select("id")
    .eq("source_wr_id", wrId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, skipped: true, reason: "already scraped" });
  }

  const sourceUrl = `${BOARD_DETAIL_URL}${wrId}`;
  let imageUrls: string[] = [];

  try {
    const detailResponse = await fetch(sourceUrl, {
      headers: { "User-Agent": USER_AGENT },
    });

    if (!detailResponse.ok) {
      return NextResponse.json(
        { error: `게시글 상세를 불러오지 못했어요. (status ${detailResponse.status})` },
        { status: 502 },
      );
    }

    const detailHtml = await detailResponse.text();
    const $detail = cheerio.load(detailHtml);

    const viewImageHrefs = $detail("#bo_v_con a.view_image")
      .map((_, el) => $detail(el).attr("href"))
      .get()
      .filter((href): href is string => Boolean(href));

    if (viewImageHrefs.length > 0) {
      imageUrls = viewImageHrefs;
    } else {
      imageUrls = $detail("#bo_v_con img")
        .map((_, el) => $detail(el).attr("src"))
        .get()
        .filter((src): src is string => Boolean(src));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "게시글 상세 스크랩에 실패했어요.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("sermon_drafts")
    .insert({
      source_wr_id: wrId,
      source_url: sourceUrl,
      title,
      sermon_date: sermonDate,
      image_urls: imageUrls,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true, inserted: true, draftId: inserted.id });
}
