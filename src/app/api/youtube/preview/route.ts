import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  parseYoutubeLink,
  youtubePlayAllUrl,
} from "@/lib/supabase/queries/praiseSet";
import { fetchPlaylistPreview } from "@/lib/youtube/playlistPreview";

/**
 * 유튜브 링크의 썸네일과 "바로 재생" 주소를 알려준다.
 * 재생목록은 주소만 봐서는 썸네일을 알 수 없어 유튜브에 한 번 물어봐야 한다.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const rawUrl = new URL(request.url).searchParams.get("url");
  const link = rawUrl ? parseYoutubeLink(rawUrl) : null;

  if (!link) {
    return NextResponse.json({ error: "유튜브 링크가 아니에요." }, { status: 400 });
  }

  // 영상 링크는 썸네일 주소를 바로 만들 수 있어 유튜브에 물어보지 않는다.
  if (link.videoId || !link.playlistId) {
    return NextResponse.json({
      thumbnailUrl: link.thumbnailUrl,
      title: null,
      playUrl: link.url,
    });
  }

  const preview = await fetchPlaylistPreview(link.playlistId);

  return NextResponse.json(
    {
      thumbnailUrl: preview?.thumbnailUrl ?? null,
      title: preview?.title ?? null,
      // 첫 영상을 알아냈으면 재생목록이 처음부터 순서대로 이어서 재생된다.
      playUrl: youtubePlayAllUrl(link.playlistId, preview?.firstVideoId ?? null),
    },
    { headers: { "Cache-Control": "private, max-age=3600" } },
  );
}
