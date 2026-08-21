import type { SupabaseClient } from "@supabase/supabase-js";
import type { PraiseSheet, SermonSummary } from "@/lib/mock-data";
import { monthDayOf, toDateString } from "./utils";

export interface GroupPageData {
  meetingTitle: string;
  bulletinImageUrls: string[];
  sermonImageUrls: string[];
  sermonId: string | null;
  sermonSummary: SermonSummary | null;
  praiseSheets: PraiseSheet[];
}

/**
 * 선택한 날짜(없으면 오늘) 기준으로 그 날짜까지 올라온 가장 최근 설교안·주보를 가져온다.
 * 가교모임 자료가 주 단위로 올라오기 때문에, 주중 아무 날짜를 골라도
 * 그 주에 해당하는 자료가 보이도록 "선택일 이전 중 최신"으로 찾는다.
 */
export async function fetchGroupPageData(
  supabase: SupabaseClient,
  selectedDate?: string,
): Promise<GroupPageData> {
  const todayStr = selectedDate ?? toDateString(new Date());

  const [{ data: sermon }, { data: bulletin }] = await Promise.all([
    supabase
      .from("sermons")
      .select(
        "id, sermon_date, image_urls, category_label, title, preacher, quote, summary_paragraphs, sharing_questions",
      )
      .lte("sermon_date", todayStr)
      .order("sermon_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("bulletins")
      .select("image_urls")
      .lte("bulletin_date", todayStr)
      .order("bulletin_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const { data: songRows } = sermon
    ? await supabase
        .from("sermon_songs")
        .select("id, musical_key, title, sheet_url")
        .eq("sermon_id", sermon.id)
        .order("display_order", { ascending: true })
    : { data: [] };

  const { month, day } = sermon
    ? monthDayOf(sermon.sermon_date)
    : monthDayOf(todayStr);

  const sermonSummary: SermonSummary | null = sermon
    ? {
        categoryLabel: sermon.category_label,
        title: sermon.title,
        preacher: sermon.preacher,
        quote: sermon.quote,
        paragraphs: (sermon.summary_paragraphs ?? []) as string[],
        sharingQuestions: (sermon.sharing_questions ?? []) as {
          id: number;
          question: string;
        }[],
      }
    : null;

  return {
    meetingTitle: `가교모임 (${month}월 ${day}일)`,
    bulletinImageUrls: (bulletin?.image_urls ?? []) as string[],
    sermonImageUrls: (sermon?.image_urls ?? []) as string[],
    sermonId: sermon?.id ?? null,
    sermonSummary,
    praiseSheets: (songRows ?? []).map((row) => ({
      id: row.id,
      key: row.musical_key ?? "",
      title: row.title,
      sheetUrl: row.sheet_url ?? null,
    })),
  };
}
