import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  PraiseSheet,
  SermonInfo,
  SermonSummary,
  SharingQuestion,
} from "@/lib/mock-data";
import { monthDayOf, toDateString } from "./utils";

export interface GroupPageData {
  meetingTitle: string;
  sermonInfo: SermonInfo;
  sermonSummary: SermonSummary;
  sharingQuestions: SharingQuestion[];
  praiseSheets: PraiseSheet[];
}

export async function fetchGroupPageData(
  supabase: SupabaseClient,
): Promise<GroupPageData | null> {
  const { data: sermon } = await supabase
    .from("sermons")
    .select(
      "id, category_label, title, reference, preacher, sermon_date, quote, summary_paragraphs, sharing_questions",
    )
    .lte("sermon_date", toDateString(new Date()))
    .order("sermon_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sermon) return null;

  const { data: songRows } = await supabase
    .from("sermon_songs")
    .select("id, musical_key, title")
    .eq("sermon_id", sermon.id)
    .order("display_order", { ascending: true });

  const { month, day } = monthDayOf(sermon.sermon_date);

  return {
    meetingTitle: `가교모임 (${month}월 ${day}일)`,
    sermonInfo: {
      categoryLabel: sermon.category_label ?? "",
      title: sermon.title,
      reference: sermon.reference ?? "",
      preacher: sermon.preacher ?? "",
    },
    sermonSummary: {
      quote: sermon.quote ?? "",
      paragraphs: (sermon.summary_paragraphs ?? []) as string[],
    },
    sharingQuestions: (sermon.sharing_questions ?? []) as SharingQuestion[],
    praiseSheets: (songRows ?? []).map((row) => ({
      id: row.id,
      key: row.musical_key ?? "",
      title: row.title,
    })),
  };
}
