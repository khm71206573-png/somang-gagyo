import { NextResponse } from "next/server";
import { scrapeDevotion } from "@/lib/automation/scrapeDevotion";
import { HttpError } from "@/lib/automation/HttpError";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await scrapeDevotion();
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "오늘의 묵상 스크랩에 실패했어요.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
