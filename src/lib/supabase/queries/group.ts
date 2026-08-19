import type { SupabaseClient } from "@supabase/supabase-js";
import type { PraiseSheet, SermonInfo } from "@/lib/mock-data";
import { monthDayOf, toDateString } from "./utils";

export interface GroupPageData {
  meetingTitle: string;
  sermonInfo: SermonInfo | null;
  bulletinImageUrls: string[];
  sermonImageUrls: string[];
  sermonId: string | null;
  praiseSheets: PraiseSheet[];
}

export async function fetchGroupPageData(
  supabase: SupabaseClient,
): Promise<GroupPageData> {
  const todayStr = toDateString(new Date());

  const [{ data: sermon }, { data: bulletin }] = await Promise.all([
    supabase
      .from("sermons")
      .select("id, category_label, title, reference, preacher, sermon_date, image_urls")
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

  return {
    meetingTitle: `가교모임 (${month}월 ${day}일)`,
    sermonInfo: sermon
      ? {
          categoryLabel: sermon.category_label ?? "",
          title: sermon.title,
          reference: sermon.reference ?? "",
          preacher: sermon.preacher ?? "",
        }
      : null,
    bulletinImageUrls: (bulletin?.image_urls ?? []) as string[],
    sermonImageUrls: (sermon?.image_urls ?? []) as string[],
    sermonId: sermon?.id ?? null,
    praiseSheets: (songRows ?? []).map((row) => ({
      id: row.id,
      key: row.musical_key ?? "",
      title: row.title,
      sheetUrl: row.sheet_url ?? null,
    })),
  };
}
