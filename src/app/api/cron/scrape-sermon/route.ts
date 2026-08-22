import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/automation/cronAuth";
import { scrapeSermon } from "@/lib/automation/scrapeSermon";
import { HttpError } from "@/lib/automation/HttpError";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = checkCronAuth(request);
  if (authError) return authError;

  try {
    const result = await scrapeSermon();
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "설교안 스크랩에 실패했어요.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
