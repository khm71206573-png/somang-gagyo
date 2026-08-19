import { NextResponse } from "next/server";
import { syncSong } from "@/lib/automation/syncSong";
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
    const result = await syncSong();
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "유튜브 좋아요 목록 동기화에 실패했어요.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
