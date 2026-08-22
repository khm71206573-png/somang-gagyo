import type { SupabaseClient } from "@supabase/supabase-js";
import { PRAYER_SCOPE_COMMUNITY, PRAYER_SCOPE_MINE } from "@/lib/mock-data";
import type {
  GreetingInfo,
  StreakInfo,
  DevotionInfo,
  BibleReadingInfo,
  SongInfo,
  BirthdayInfo,
  EventItem,
} from "@/lib/mock-data";
import {
  fetchActiveMemberPlan,
  fetchActivePlanMembers,
  countReadingLogsForPlanDay,
} from "./reading-plan";
import {
  WEEKDAY_LABELS,
  toDateString,
  toMidnight,
  monthDayOf,
  formatDateLabel,
  avatarFallback,
  unwrapRelation,
} from "./utils";

/** 홈 화면 기도제목 카드에 쓰는 범위별 요약 */
export interface PrayerScopeSummary {
  label: string;
  count: number;
  /** 홈 카드에서 하나씩 돌아가며 보여줄 최근 기도제목들 (최신순) */
  contents: string[];
}

export interface PrayerSummary {
  community: PrayerScopeSummary;
  mine: PrayerScopeSummary;
}

export interface DashboardData {
  greeting: GreetingInfo;
  streak: StreakInfo;
  devotion: DevotionInfo | null;
  bibleReading: BibleReadingInfo | null;
  song: SongInfo | null;
  birthday: BirthdayInfo | null;
  prayerSummary: PrayerSummary;
  upcomingEvents: EventItem[];
}

function greetingMessageFor(hour: number) {
  if (hour < 11) return "좋은 아침이에요";
  if (hour < 18) return "평안한 오후 되세요";
  return "편안한 저녁 되세요";
}

interface DashboardProfile {
  name: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

async function fetchProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<DashboardProfile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("name, avatar_url, created_at")
    .eq("id", userId)
    .maybeSingle();

  return (data as DashboardProfile | null) ?? null;
}

function buildGreeting(profile: DashboardProfile | null): GreetingInfo {
  const now = new Date();
  const name = profile?.name ?? "성도";

  return {
    dateLabel: formatDateLabel(now),
    userName: name,
    greetingMessage: greetingMessageFor(now.getHours()),
    profileImageUrl: profile?.avatar_url ?? avatarFallback(name),
  };
}

/**
 * 가입일부터 오늘까지 며칠째인지 센다. 가입 당일이 1일째다.
 * 가입일을 알 수 없으면 오늘 시작한 것으로 보고 1을 돌려준다.
 */
function joinedDaysFrom(createdAt: string | null | undefined): number {
  if (!createdAt) return 1;

  const joined = new Date(createdAt);
  if (Number.isNaN(joined.getTime())) return 1;

  const elapsed = Math.floor(
    (toMidnight(new Date()).getTime() - toMidnight(joined).getTime()) / 86400000,
  );

  return Math.max(elapsed + 1, 1);
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

  const isPaused = Boolean(memberPlan.paused_at);

  return {
    tag: isPaused ? "잠시 쉬는 중" : "말씀 읽기",
    planName: plan?.title ?? "",
    passage: isPaused ? "통독을 잠시 쉬고 있어요" : planDay.passage,
    isCompleted,
    isPaused,
    memberPlanId: memberPlan.id,
    planDayId: planDay.id,
    currentDay: memberPlan.current_day,
    totalDays,
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

/** 홈 카드에서 순서대로 돌려 보여줄 기도제목 개수 */
const PRAYER_ROTATION_LIMIT = 5;

/** "우리 가교"·"나의 기도" 각각의 건수와 최근 기도제목들을 가져온다. */
async function fetchPrayerSummary(
  supabase: SupabaseClient,
  userId: string,
): Promise<PrayerSummary> {
  const [community, mine] = await Promise.all([
    supabase
      .from("prayer_requests")
      .select("content", { count: "exact" })
      .eq("category", PRAYER_SCOPE_COMMUNITY)
      .order("created_at", { ascending: false })
      .limit(PRAYER_ROTATION_LIMIT),
    supabase
      .from("prayer_requests")
      .select("content", { count: "exact" })
      .eq("category", PRAYER_SCOPE_MINE)
      .eq("member_id", userId)
      .order("created_at", { ascending: false })
      .limit(PRAYER_ROTATION_LIMIT),
  ]);

  return {
    community: {
      label: PRAYER_SCOPE_COMMUNITY,
      count: community.count ?? 0,
      contents: (community.data ?? []).map((row) => row.content as string),
    },
    mine: {
      label: PRAYER_SCOPE_MINE,
      count: mine.count ?? 0,
      contents: (mine.data ?? []).map((row) => row.content as string),
    },
  };
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
    profile,
    devotion,
    bibleReading,
    song,
    prayerSummary,
    upcomingEvents,
  ] = await Promise.all([
    fetchProfile(supabase, user.id),
    fetchDevotion(supabase, todayStr),
    fetchBibleReading(supabase, memberPlan),
    fetchSong(supabase, todayStr),
    fetchPrayerSummary(supabase, user.id),
    fetchUpcomingEvents(supabase, todayStr),
  ]);

  return {
    greeting: buildGreeting(profile),
    // 통독 연속일이 아니라 가입 후 함께한 날수를 센다. 통독을 시작하지
    // 않았거나 하루 걸러도 멈추지 않는다.
    streak: { days: joinedDaysFrom(profile?.created_at) },
    devotion,
    bibleReading,
    song,
    // profiles에는 birth_date가 없어 생일 카드는 당분간 비활성화 상태
    birthday: null,
    prayerSummary,
    upcomingEvents,
  };
}
