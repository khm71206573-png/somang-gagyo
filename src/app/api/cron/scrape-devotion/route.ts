import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/automation/cronAuth";
import { scrapeDevotion } from "@/lib/automation/scrapeDevotion";
import { HttpError } from "@/lib/automation/HttpError";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = checkCronAuth(request);
  if (authError) return authError;

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
