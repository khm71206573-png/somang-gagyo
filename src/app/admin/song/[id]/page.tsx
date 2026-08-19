"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminFormTopBar } from "@/components/admin/AdminFormTopBar";
import {
  fieldGroup,
  fieldInput,
  fieldLabel,
  fieldTextarea,
  errorText,
  submitButton,
} from "@/components/admin/adminFormStyles";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { useSong } from "@/hooks/useSong";
import { useUpdateSong } from "@/hooks/useUpdateSong";
import { linesToBlocks } from "@/lib/adminFormParsing";

export default function EditSongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isFetching } = useSong(id);
  const { mutateAsync, isPending } = useUpdateSong();

  const [songDate, setSongDate] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setSongDate(data.song_date);
    setTitle(data.title);
    setArtist(data.artist ?? "");
    setCoverImageUrl(data.cover_image_url ?? "");
    setYoutubeUrl(data.youtube_url ?? "");
    setLyrics(linesToBlocks(data.lyrics.map((stanza) => stanza.lines)));
    setReason(data.reason ?? "");
  }, [data]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("곡 제목을 입력해주세요.");
      return;
    }

    try {
      await mutateAsync({
        id,
        songDate,
        title,
        artist,
        coverImageUrl,
        youtubeUrl,
        lyrics,
        reason,
      });
      router.push("/admin/song");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "수정에 실패했어요.");
    }
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-background pb-[104px]">
      <AdminFormTopBar title="찬양 수정" />
      <main className="px-margin-main pt-stack-sm">
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
            <label htmlFor="reason" className={fieldLabel}>
              추천 이유 <span className="text-muted-foreground">(선택)</span>
            </label>
            <textarea
              id="reason"
              rows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="오늘 이 곡을 추천하는 이유"
              className={fieldTextarea}
            />
          </div>

          <div className={fieldGroup}>
            <label htmlFor="lyrics" className={fieldLabel}>
              가사 <span className="text-muted-foreground">(선택, 구간은 빈 줄로 구분)</span>
            </label>
            <textarea
              id="lyrics"
              rows={8}
              value={lyrics}
              onChange={(event) => setLyrics(event.target.value)}
              placeholder={"1절 첫 줄\n1절 둘째 줄\n\n2절 첫 줄"}
              className={fieldTextarea}
            />
          </div>

          {formError && <p className={errorText}>{formError}</p>}

          <button type="submit" disabled={isPending} className={submitButton}>
            {isPending ? "수정 중..." : "찬양 수정하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
