import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DevotionCommentarySection,
  DevotionDetail,
  DevotionFootnote,
  SharedReflection,
} from "@/lib/mock-data";
import { formatDateLabel, formatTimeAgo, unwrapRelation } from "./utils";

export interface DevotionPageData {
  /** 나눔을 남길 때 devotion_notes.devotion_id로 쓴다. */
  devotionId: string;
  devotion: DevotionDetail;
  sharedReflections: SharedReflection[];
  participantCount: number;
}

export async function fetchDevotionPageData(
  supabase: SupabaseClient,
): Promise<DevotionPageData | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: devotionRow } = await supabase
    .from("devotions")
    .select(
      "id, devotion_date, title, reference, verses, questions, hymn, commentary, prayer, practice, footnotes, image_urls",
    )
    .order("devotion_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!devotionRow) return null;

  const { data: noteRows } = await supabase
    .from("devotion_notes")
    .select(
      "id, content, created_at, member_id, member:profiles(name, avatar_url)",
    )
    .eq("devotion_id", devotionRow.id)
    .order("created_at", { ascending: false });

  const verses = (devotionRow.verses ?? []) as {
    number: number;
    text: string;
  }[];

  const questions = (devotionRow.questions ?? []) as {
    id: number;
    question: string;
  }[];

  const devotion: DevotionDetail = {
    dateLabel: formatDateLabel(new Date(`${devotionRow.devotion_date}T00:00:00`)),
    title: devotionRow.title,
    reference: devotionRow.reference,
    verses,
    questions,
    hymn: devotionRow.hymn ?? null,
    commentary: (devotionRow.commentary ?? []) as DevotionCommentarySection[],
    prayer: devotionRow.prayer ?? null,
    practice: devotionRow.practice ?? null,
    footnotes: (devotionRow.footnotes ?? []) as DevotionFootnote[],
    imageUrls: (devotionRow.image_urls ?? []) as string[],
  };

  const sharedReflections: SharedReflection[] = (noteRows ?? []).map((row) => {
    const member = unwrapRelation(
      row.member as
        | { name: string; avatar_url: string | null }
        | { name: string; avatar_url: string | null }[]
        | null,
    );

    return {
      id: row.id,
      author: member?.name ?? "성도",
      avatarUrl: member?.avatar_url ?? undefined,
      timeAgo: formatTimeAgo(row.created_at),
      content: row.content,
      isLiked: false,
      isMine: Boolean(user) && row.member_id === user?.id,
    };
  });

  const participantCount = new Set(
    (noteRows ?? []).map((row) => row.member_id),
  ).size;

  return { devotionId: devotionRow.id, devotion, sharedReflections, participantCount };
}
