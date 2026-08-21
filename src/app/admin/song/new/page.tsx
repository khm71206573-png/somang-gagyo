"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { AdminFormTopBar } from "@/components/admin/AdminFormTopBar";
import {
  fieldGroup,
  fieldInput,
  fieldLabel,
  fieldTextarea,
  errorText,
  submitButton,
} from "@/components/admin/adminFormStyles";
import { useCreateSong } from "@/hooks/useCreateSong";
import { useFetchSongSource } from "@/hooks/useFetchSongSource";
import type { SongSource } from "@/lib/youtube/resolvePlaylist";
import { toDateString } from "@/lib/supabase/queries/utils";

export default function NewSongPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateSong();
  const {
    mutateAsync: fetchSource,
    isPending: isFetchingSource,
    variables: fetchingSource,
  } = useFetchSongSource();

  const [songDate, setSongDate] = useState(toDateString(new Date()));
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [lyrics, setLyrics] = useState("");
  // "추천 이유"는 UI에서 뺐지만, 이미 등록된 곡의 값은 그대로 보존해 같이 보낸다.
  const [reason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleFetchSource(source: SongSource) {
    setError(null);
    try {
      const fetched = await fetchSource(source);
      setTitle(fetched.title);
      setArtist(fetched.artist);
      setCoverImageUrl(fetched.coverImageUrl);
      setYoutubeUrl(fetched.youtubeUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "유튜브 목록을 가져오지 못했어요.");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("곡 제목을 입력해주세요.");
      return;
    }

    try {
      await mutateAsync({
        songDate,
        title,
        artist,
        coverImageUrl,
        youtubeUrl,
        lyrics,
        reason,
      });
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "등록에 실패했어요.");
    }
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <AdminFormTopBar title="찬양 등록" listHref="/admin/song" />
      <main className="px-margin-main pt-stack-sm">
        <div className="mb-stack-md flex flex-col gap-2">
          <p className={fieldLabel}>유튜브에서 가져와 자동 입력</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFetchSource("recommended")}
              disabled={isFetchingSource}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-label-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {isFetchingSource && fetchingSource === "recommended"
                ? "가져오는 중..."
                : "추천찬양"}
            </button>
            <button
              type="button"
              onClick={() => handleFetchSource("liked")}
              disabled={isFetchingSource}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-primary bg-card px-4 py-3 text-label-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {isFetchingSource && fetchingSource === "liked"
                ? "가져오는 중..."
                : "좋아요 목록"}
            </button>
          </div>
          <p className="text-label-sm text-muted-foreground">
            재생목록에서 아직 등록되지 않은 가장 최근 곡을 불러옵니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
          <div className={fieldGroup}>
            <label htmlFor="songDate" className={fieldLabel}>
              날짜 <span className="text-destructive">*</span>
            </label>
            <input
              id="songDate"
              type="date"
              value={songDate}
              onChange={(event) => setSongDate(event.target.value)}
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="title" className={fieldLabel}>
              곡 제목 <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="곡 제목"
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="artist" className={fieldLabel}>
              아티스트 <span className="text-muted-foreground">(선택)</span>
            </label>
            <input
              id="artist"
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="coverImageUrl" className={fieldLabel}>
              커버 이미지 URL <span className="text-muted-foreground">(선택)</span>
            </label>
            <input
              id="coverImageUrl"
              value={coverImageUrl}
              onChange={(event) => setCoverImageUrl(event.target.value)}
              placeholder="https://..."
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="youtubeUrl" className={fieldLabel}>
              유튜브 URL <span className="text-muted-foreground">(선택)</span>
            </label>
            <input
              id="youtubeUrl"
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder="https://youtube.com/..."
              className={fieldInput}
            />
          </div>

          <div className={fieldGroup}>
            <div className="flex items-center justify-between">
              <label htmlFor="lyrics" className={fieldLabel}>
                가사 <span className="text-muted-foreground">(선택, 구간은 빈 줄로 구분)</span>
              </label>
              {title.trim() && (
                <a
                  href={`https://search.naver.com/search.naver?query=${encodeURIComponent(`${title} ${artist} 가사`.trim())}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-label-sm text-primary hover:underline"
                >
                  가사 검색하기
                </a>
              )}
            </div>
            <textarea
              id="lyrics"
              rows={8}
              value={lyrics}
              onChange={(event) => setLyrics(event.target.value)}
              placeholder={"1절 첫 줄\n1절 둘째 줄\n\n2절 첫 줄"}
              className={fieldTextarea}
            />
          </div>

          {error && <p className={errorText}>{error}</p>}

          <button type="submit" disabled={isPending} className={submitButton}>
            {isPending ? "등록 중..." : "찬양 등록하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
