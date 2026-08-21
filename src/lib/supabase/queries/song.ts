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

  const { data: todayRow } = await supabase
    .from("daily_songs")
    .select("songs(title, artist, cover_image_url, youtube_url, lyrics)")
    .eq("song_date", todayStr)
    .maybeSingle();

  type SongRow = {
    title: string;
    artist: string | null;
    cover_image_url: string | null;
    youtube_url: string | null;
    lyrics: { lines?: string[] }[] | null;
  };

  const song = unwrapRelation(
    todayRow?.songs as SongRow | SongRow[] | null,
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

  const { data: pastRows } = await supabase
    .from("daily_songs")
    .select("song_date, songs(id, title, cover_image_url)")
    .lt("song_date", todayStr)
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
