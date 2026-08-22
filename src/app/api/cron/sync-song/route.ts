import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/automation/cronAuth";
import { syncSong } from "@/lib/automation/syncSong";
import { isSongSource } from "@/lib/youtube/resolvePlaylist";
import { HttpError } from "@/lib/automation/HttpError";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = checkCronAuth(request);
  if (authError) return authError;

  // 기본은 좋아요 목록. ?source=recommended 를 붙이면 추천찬양 재생목록에서 가져온다.
  const sourceParam = new URL(request.url).searchParams.get("source");
  const source = isSongSource(sourceParam) ? sourceParam : "liked";

  try {
    const result = await syncSong(source);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message =
      error instanceof Error ? error.message : "유튜브 목록 동기화에 실패했어요.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
