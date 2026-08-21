import type { SupabaseClient } from "@supabase/supabase-js";
import type { PastSong, SongDetail } from "@/lib/mock-data";
import { toDateString, unwrapRelation } from "./utils";

export interface SongPageData {
  songDetail: SongDetail | null;
  pastSongs: PastSong[];
}

export async function fetchSongPageData(
  supabase: SupabaseClient,
): Promise<SongPageData> {
  const todayStr = toDateString(new Date());

  // 오늘 날짜로 정확히 등록된 곡이 없어도, 다음 곡이 등록되기 전까지는
  // 가장 최근에 등록된 곡을 계속 보여준다. (매일 자정 새 곡이 등록되지
  // 않는 날도 있을 수 있어서 "오늘 것만" 찾으면 화면이 비어 보였다.)
  const { data: currentRow } = await supabase
    .from("daily_songs")
    .select("song_date, songs(title, artist, cover_image_url, youtube_url, lyrics)")
    .lte("song_date", todayStr)
    .order("song_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  type SongRow = {
    title: string;
    artist: string | null;
    cover_image_url: string | null;
    youtube_url: string | null;
    lyrics: { lines?: string[] }[] | null;
  };

  const song = unwrapRelation(
    currentRow?.songs as SongRow | SongRow[] | null,
  );

  const songDetail: SongDetail | null = song
    ? {
        title: song.title,
        artist: song.artist ?? "",
        coverImageUrl: song.cover_image_url ?? "",
        youtubeUrl: song.youtube_url ?? "",
        listenLabel: "유튜브로 듣기",
        lyrics: (song.lyrics ?? [])
          .map((stanza) => ({ lines: stanza.lines ?? [] }))
          .filter((stanza) => stanza.lines.length > 0),
      }
    : null;

  // 현재 보여주는 곡보다 이전 곡들만 "지난 찬양"에 나오게 한다.
  const currentSongDate = currentRow?.song_date ?? todayStr;

  const { data: pastRows } = await supabase
    .from("daily_songs")
    .select("song_date, songs(id, title, cover_image_url)")
    .lt("song_date", currentSongDate)
    .order("song_date", { ascending: false })
    .limit(5);

  type PastSongRow = { id: string; title: string; cover_image_url: string | null };

  const pastSongs: PastSong[] = (pastRows ?? [])
    .map((row) => {
      const s = unwrapRelation(row.songs as PastSongRow | PastSongRow[] | null);
      if (!s) return null;
      return { id: s.id, title: s.title, coverImageUrl: s.cover_image_url ?? "" };
    })
    .filter((s): s is PastSong => s !== null);

  return { songDetail, pastSongs };
}
