import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DevotionCommentarySection,
  DevotionDetail,
  DevotionFootnote,
  SharedReflection,
} from "@/lib/mock-data";
import {
  DEFAULT_DEVOTION_SOURCE,
  DEVOTION_SOURCE_PREFERENCE,
  toDevotionSource,
  type DevotionSource,
} from "@/lib/devotionSource";
import { formatDateLabel, formatTimeAgo, unwrapRelation } from "./utils";

export interface DevotionPageData {
  /** 나눔을 남길 때 devotion_notes.devotion_id로 쓴다. */
  devotionId: string;
  /** 실제로 보여주는 출처. 고른 출처에 아직 묵상이 없으면 있는 쪽으로 바뀐다. */
  source: DevotionSource;
  /** 묵상이 하나라도 올라온 출처들 (탭을 몇 개 보여줄지 정한다) */
  availableSources: DevotionSource[];
  devotion: DevotionDetail;
  sharedReflections: SharedReflection[];
  participantCount: number;
}

interface DevotionIndexRow {
  id: string;
  devotion_date: string;
  source: string | null;
}

/**
 * 최근 묵상 목록을 가볍게(본문 없이) 훑어 출처별 가장 최근 한 건을 고른다.
 * 매일성경과 하나님나라QT가 서로 다른 날짜까지 올라와 있어도 각각 최신 것을 잡는다.
 */
function latestBySource(rows: DevotionIndexRow[]) {
  const latest = new Map<DevotionSource, DevotionIndexRow>();

  // 날짜 내림차순으로 받아왔으므로 처음 만난 것이 그 출처의 최신이다.
  for (const row of rows) {
    const source = toDevotionSource(row.source);
    if (!latest.has(source)) {
      latest.set(source, row);
    }
  }

  return latest;
}

export async function fetchDevotionPageData(
  supabase: SupabaseClient,
  requestedSource?: DevotionSource,
): Promise<DevotionPageData | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: indexRows } = await supabase
    .from("devotions")
    .select("id, devotion_date, source")
    .order("devotion_date", { ascending: false })
    .limit(60);

  const latest = latestBySource((indexRows ?? []) as DevotionIndexRow[]);

  if (latest.size === 0) return null;

  const availableSources = DEVOTION_SOURCE_PREFERENCE.filter((source) =>
    latest.has(source),
  );

  // 아직 탭을 고르지 않았으면 가장 최근에 올라온 쪽을 보여준다.
  // 한쪽 등록이 며칠 밀렸을 때 묵은 묵상이 먼저 뜨지 않게 하려는 것.
  const defaultSource = availableSources.reduce(
    (best, candidate) => {
      const bestDate = latest.get(best)?.devotion_date ?? "";
      const candidateDate = latest.get(candidate)?.devotion_date ?? "";
      return candidateDate > bestDate ? candidate : best;
    },
    availableSources[0] ?? DEFAULT_DEVOTION_SOURCE,
  );

  // 고른 출처에 아직 묵상이 없으면 있는 쪽을 보여준다.
  const source =
    requestedSource && latest.has(requestedSource)
      ? requestedSource
      : defaultSource;

  const indexRow = latest.get(source);
  if (!indexRow) return null;

  const { data: devotionRow } = await supabase
    .from("devotions")
    .select(
      "id, devotion_date, title, reference, verses, questions, hymn, commentary, prayer, practice, footnotes, image_urls",
    )
    .eq("id", indexRow.id)
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

  return {
    devotionId: devotionRow.id,
    source,
    availableSources,
    devotion,
    sharedReflections,
    participantCount,
  };
}
