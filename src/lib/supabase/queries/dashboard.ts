import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  GreetingInfo,
  StreakInfo,
  DevotionInfo,
  BibleReadingInfo,
  SongInfo,
  BirthdayInfo,
  PrayerRequest,
  EventItem,
} from "@/lib/mock-data";
import {
  fetchActiveMemberPlan,
  fetchActivePlanMembers,
  countReadingLogsForPlanDay,
  fetchStreakDays,
} from "./reading-plan";
import {
  WEEKDAY_LABELS,
  toDateString,
  monthDayOf,
  formatDateLabel,
  avatarFallback,
  unwrapRelation,
} from "./utils";

export interface DashboardData {
  greeting: GreetingInfo;
  streak: StreakInfo;
  devotion: DevotionInfo | null;
  bibleReading: BibleReadingInfo | null;
  song: SongInfo | null;
  birthday: BirthdayInfo | null;
  prayerRequests: PrayerRequest[];
  upcomingEvents: EventItem[];
}

function greetingMessageFor(hour: number) {
  if (hour < 11) return "좋은 아침이에요";
  if (hour < 18) return "평안한 오후 되세요";
  return "편안한 저녁 되세요";
}

async function fetchGreeting(
  supabase: SupabaseClient,
  userId: string,
): Promise<GreetingInfo> {
  const { data: member } = await supabase
    .from("members")
    .select("name, profile_image_url")
    .eq("id", userId)
    .maybeSingle();

  const now = new Date();
  const name = member?.name ?? "성도";

  return {
    dateLabel: formatDateLabel(now),
    userName: name,
    greetingMessage: greetingMessageFor(now.getHours()),
    profileImageUrl: member?.profile_image_url ?? avatarFallback(name),
  };
}

async function fetchDevotion(
  supabase: SupabaseClient,
  todayStr: string,
): Promise<DevotionInfo | null> {
  const { data } = await supabase
    .from("devotions")
    .select("tag, reference, verses")
    .eq("devotion_date", todayStr)
    .maybeSingle();

  if (!data) return null;

  const verses = (data.verses ?? []) as { number: number; text: string }[];

  return {
    tag: data.tag ?? "오늘의 묵상",
    reference: data.reference,
    verse: verses.map((v) => v.text).join(" "),
  };
}

async function fetchBibleReading(
  supabase: SupabaseClient,
  memberPlan: Awaited<ReturnType<typeof fetchActiveMemberPlan>>,
): Promise<BibleReadingInfo | null> {
  if (!memberPlan) return null;

  const plan = unwrapRelation(memberPlan.bible_plans);

  const { data: planDay } = await supabase
    .from("plan_days")
    .select("id, passage")
    .eq("plan_id", memberPlan.plan_id)
    .eq("day_number", memberPlan.current_day)
    .maybeSingle();

  if (!planDay) return null;

  const activePlanMembers = await fetchActivePlanMembers(supabase, memberPlan.plan_id);
  const activePlanIds = activePlanMembers.map((p) => p.id);

  const [completedToday, isCompleted] = await Promise.all([
    countReadingLogsForPlanDay(supabase, planDay.id, activePlanIds),
    activePlanIds.includes(memberPlan.id)
      ? supabase
          .from("reading_logs")
          .select("id")
          .eq("member_plan_id", memberPlan.id)
          .eq("plan_day_id", planDay.id)
          .maybeSingle()
          .then(({ data }) => Boolean(data))
      : Promise.resolve(false),
  ]);

  const totalDays = plan?.total_days ?? 0;
  const progressPercent =
    totalDays > 0
      ? Math.round((memberPlan.current_day / totalDays) * 100)
      : 0;

  return {
    tag: "말씀 읽기",
    planName: plan?.title ?? "",
    passage: planDay.passage,
    isCompleted,
    communityProgressLabel: `우리 교회 ${completedToday}/${activePlanIds.length}명 완독`,
    progressPercent,
  };
}

async function fetchSong(
  supabase: SupabaseClient,
  todayStr: string,
): Promise<SongInfo | null> {
  const { data } = await supabase
    .from("daily_songs")
    .select("songs(title, artist, cover_image_url)")
    .eq("song_date", todayStr)
    .maybeSingle();

  const song = unwrapRelation(data?.songs ?? null);
  if (!song) return null;

  return {
    title: song.title,
    artist: song.artist ?? "",
    coverImageUrl: song.cover_image_url ?? "",
  };
}

async function fetchBirthday(
  supabase: SupabaseClient,
  todayStr: string,
): Promise<BirthdayInfo | null> {
  const { month: todayMonth, day: todayDay } = monthDayOf(todayStr);

  const { data } = await supabase
    .from("members")
    .select("name, profile_image_url, birth_date")
    .eq("status", "approved")
    .not("birth_date", "is", null);

  const matches = (data ?? []).filter((m) => {
    if (!m.birth_date) return false;
    const { month, day } = monthDayOf(m.birth_date);
    return month === todayMonth && day === todayDay;
  });

  if (matches.length === 0) return null;

  return {
    names: matches.map((m) => m.name),
    avatarUrls: matches.map((m) => m.profile_image_url ?? avatarFallback(m.name)),
  };
}

async function fetchPrayerRequests(
  supabase: SupabaseClient,
): Promise<PrayerRequest[]> {
  const { data } = await supabase
    .from("prayer_requests")
    .select(
      "display_name, content, created_at, member:members(name), prayer_reactions(count)",
    )
    .order("created_at", { ascending: false })
    .limit(3);

  return (data ?? []).map((row) => {
    const member = unwrapRelation(row.member as { name: string } | { name: string }[] | null);
    const reactions = unwrapRelation(
      row.prayer_reactions as { count: number } | { count: number }[] | null,
    );

    return {
      author: row.display_name ?? member?.name ?? "성도",
      content: row.content,
      prayingCount: reactions?.count ?? 0,
    };
  });
}

async function fetchUpcomingEvents(
  supabase: SupabaseClient,
  todayStr: string,
): Promise<EventItem[]> {
  const { data } = await supabase
    .from("events")
    .select("title, event_date")
    .gte("event_date", todayStr)
    .order("event_date", { ascending: true })
    .limit(3);

  return (data ?? []).map((event) => {
    const { month, day } = monthDayOf(event.event_date);
    const weekdayIndex = new Date(`${event.event_date}T00:00:00`).getDay();

    return {
      month: String(month),
      day: String(day).padStart(2, "0"),
      weekday: WEEKDAY_LABELS[weekdayIndex],
      title: event.title,
    };
  });
}

export async function fetchDashboardData(
  supabase: SupabaseClient,
): Promise<DashboardData> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const todayStr = toDateString(new Date());
  const memberPlan = await fetchActiveMemberPlan(supabase, user.id);

  const [
    greeting,
    devotion,
    bibleReading,
    song,
    birthday,
    prayerRequests,
    upcomingEvents,
    streakDays,
  ] = await Promise.all([
    fetchGreeting(supabase, user.id),
    fetchDevotion(supabase, todayStr),
    fetchBibleReading(supabase, memberPlan),
    fetchSong(supabase, todayStr),
    fetchBirthday(supabase, todayStr),
    fetchPrayerRequests(supabase),
    fetchUpcomingEvents(supabase, todayStr),
    fetchStreakDays(supabase, memberPlan?.id ?? null),
  ]);

  return {
    greeting,
    streak: { days: streakDays },
    devotion,
    bibleReading,
    song,
    birthday,
    prayerRequests,
    upcomingEvents,
  };
}
