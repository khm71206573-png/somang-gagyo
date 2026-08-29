import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/automation/cronAuth";
import { syncSong } from "@/lib/automation/syncSong";
import { isSongSource } from "@/lib/youtube/resolvePlaylist";
import { HttpError } from "@/lib/automation/HttpError";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = checkCronAuth(request);
  if (authError) return authError;

  // 기본은 추천찬양 재생목록. ?source=liked 를 붙이면 좋아요 목록에서 가져온다.
  // (좋아요 목록은 계정 개인 데이터라 유튜브 OAuth 인증이 설정돼 있어야 한다)
  const sourceParam = new URL(request.url).searchParams.get("source");
  const source = isSongSource(sourceParam) ? sourceParam : "recommended";

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
