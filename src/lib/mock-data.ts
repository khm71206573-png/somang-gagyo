export interface GreetingInfo {
  dateLabel: string;
  userName: string;
  greetingMessage: string;
  profileImageUrl: string;
}

export interface StreakInfo {
  days: number;
}

export interface DevotionInfo {
  tag: string;
  reference: string;
  verse: string;
}

export interface BibleReadingInfo {
  tag: string;
  planName: string;
  passage: string;
  isCompleted: boolean;
  communityProgressLabel: string;
  progressPercent: number;
  /** 완독 체크에 필요한 값 */
  memberPlanId: string;
  planDayId: string;
  currentDay: number;
  totalDays: number;
}

export interface SongInfo {
  title: string;
  artist: string;
  coverImageUrl: string;
}

export interface BirthdayInfo {
  names: string[];
  avatarUrls: string[];
}

export interface PrayerRequest {
  author: string;
  content: string;
  prayingCount: number;
}

export interface EventItem {
  month: string;
  day: string;
  weekday: string;
  title: string;
}

export const greeting: GreetingInfo = {
  dateLabel: "2026년 8월 16일 주일",
  userName: "김성경",
  greetingMessage: "좋은 아침이에요",
  profileImageUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC5y1fIb_aukDrjaI1NuhzpK8oaQr26K-eRlLZj36PL72tVTbNWGSEO3nHubLQK3eBVtm_XbsUpEl9J8a_4BbSKyxq2K1GJq1yU1UFX1Lm6yDFHcaCQSSoT0dFo5ENU5NEsijmsJmL9PkE9NOGWufNFSgs67n5op8jgjrly9nR2uRsODAoW0g3kTSgP2Q08MmmZnvxWeOmFjZY3zDQLJjNz4Mb4nLFTdS7PfAhra8j_VJDlls2ZYTTW",
};

export const streak: StreakInfo = {
  days: 7,
};

export const devotion: DevotionInfo = {
  tag: "오늘의 묵상",
  reference: "시편 23:1-3",
  verse:
    "여호와는 나의 목자시니 내게 부족함이 없으리로다 그가 나를 푸른 풀밭에 누이시며 쉴 만한 물 가로 인도하시는도다",
};

export const bibleReading: BibleReadingInfo = {
  tag: "말씀 읽기",
  planName: "1년 1독",
  passage: "창세기 12-14장",
  isCompleted: false,
  communityProgressLabel: "우리 교회 32/48명 완독",
  progressPercent: 66,
  memberPlanId: "",
  planDayId: "",
  currentDay: 1,
  totalDays: 365,
};

export const song: SongInfo = {
  title: "내 모습 이대로",
  artist: "제이어스 (J-US)",
  coverImageUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCOHcjquMqIiU60E-q6Wer8qHv8bidgmYqkUXASuhyM8oLdngjSA5eWO9gbcRf_cbgDQomMGtT40wDudumxFnCL_QmDIXPJqIjgtOyRaJhCS4ktxSM8Uk5EM-cj6kMOPF-Rumg5Zeax-W9CfvD4I8He7A8eFEleZyxrstH3bGvW4SqcgZW8W9xEA_rlcPgolbD76fhZUG0VH5QAEfJdAP9Xx8c9ryOVXr3uo7pWiqeNKJKymrHzAUYH",
};

export const birthday: BirthdayInfo = {
  names: ["이온유", "박기쁨", "최사랑"],
  avatarUrls: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBqA2_OydPWnabj5A7BM7Oq-QqZjSmFqmor94aHKJ3enEpkMvi9Tc-lGcwcTZQT5ZWfmjKmjl5tr4q-86wQusvXFMvAiCyOgt5QebBTofINpnGqg66yBJZGmADJVd1kulsN3h-p1hw7jfqHQKybTWo5KCGZ3ZxIIkZo1dOsZAEuc2FH9zZpyO6bqlU6wqbuDOFhlD4uNJsHRYWP2aHhZeLc-N5ElP06vZQB0OUHm6uK3s4uUGjpUnHk",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDxKPIjaaieUuHFM6DORgX2n5bdGAeGURZFRrLNIeuOhDbrM33INCrBk4npjN3u-Z0hbuLx9TFkq0qPU7Kc7v6UjTWF_pNUqW0H3j2rwL5QUz3C_jWhy5l3YHJp8m8woaDEs-eI6eIJtyAOIqzEhTELymG1a_BZYTeoaoD35R-ZfHux6nTKuMbiRxDPStEc9hRAfMLId82FiALU3J49s1h6YYsMv3MSPsxSKfaHq_e43_KuMIoDKkkH",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB4jPHXMmQGjfcT9shuHUCCeWtqXd4MjTgv1XB7GNNMC3gvrbFK98xH5pjQopVZCc8IWcmic5Hg--XyTkWJ6x0LFPguPK6JIeXOtI9KYuIcgb9On2PyHuWnCAh7rzNWD2T7EcJprEaXmE0MTkN-3Wzn7wuyDcY1LotIzoIMIpyJsdT97wmMQKjoY865hGfq8ghH6JK9qSoH2ZhGZ2tlh16kTLMVGv60h_hmXVcDpJIy9GaWnlqYvA6V",
  ],
};

export const prayerRequests: PrayerRequest[] = [
  { author: "박지훈", content: "수험생들을 위한 기도", prayingCount: 12 },
  { author: "최영희", content: "해외 선교지 안전", prayingCount: 8 },
  { author: "공동체", content: "주일 예배를 위하여", prayingCount: 34 },
];

export const upcomingEvents: EventItem[] = [
  { month: "8", day: "19", weekday: "수", title: "정기 제직회" },
  { month: "8", day: "23", weekday: "일", title: "여름 성경학교" },
];

export interface DevotionVerse {
  number: number;
  text: string;
}

export interface ReflectionQuestion {
  id: number;
  question: string;
}

export interface DevotionDetail {
  dateLabel: string;
  title: string;
  reference: string;
  verses: DevotionVerse[];
  questions: ReflectionQuestion[];
}

export interface SharedReflection {
  id: string;
  author: string;
  avatarUrl?: string;
  timeAgo: string;
  content: string;
  isLiked: boolean;
  /** 로그인한 사용자 본인이 남긴 나눔인지 (삭제 버튼 노출에 쓴다) */
  isMine: boolean;
}

export const devotionDetail: DevotionDetail = {
  dateLabel: "2026년 8월 16일 주일",
  title: "여호와는 나의 목자시니",
  reference: "시편 23:1-3",
  verses: [
    { number: 1, text: "여호와는 나의 목자시니 내게 부족함이 없으리로다" },
    {
      number: 2,
      text: "그가 나를 푸른 풀밭에 누이시며 쉴 만한 물 가로 인도하시는도다",
    },
    {
      number: 3,
      text: "내 영혼을 소생시키시고 자기 이름을 위하여 의의 길로 인도하시는도다",
    },
  ],
  questions: [
    { id: 1, question: "오늘 본문에서 하나님은 어떤 분으로 묘사되고 있나요?" },
    { id: 2, question: "내 삶에서 '푸른 풀밭'과 '쉴 만한 물 가'는 어디인가요?" },
    { id: 3, question: "이 본문을 읽고 오늘 하루 실천하고 싶은 것은 무엇인가요?" },
  ],
};

export const sharedReflections: SharedReflection[] = [
  {
    id: "1",
    author: "김은혜",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBBcI_1IIGbhtTBMv6BxoRsgGtRI_KQYM6agNqb7zZAv8orjSrbxe8Sf3K5bCfg_9cRPLTcWdLBh73g7_G2tk4aLiAC9KcCfjNCcmixijGEjT4NoZFO8UTveLjMkV38cv1dVrquSta33NccKuIPeewYXZ9mUep7V6l8k94WSzKkhycjx-EXuFcciMzdGVPSBWw8x6LTp_W38Y0iTd0E1CbwDCgHWH0RTb2mcV5gLHrpXJ7Psi5UFXiX",
    timeAgo: "2시간 전",
    content:
      "지치고 힘든 일상 속에서 주님이 나의 목자 되심을 다시 한번 기억합니다. 늘 좋은 곳으로 인도하시는 주님을 신뢰합니다.",
    isLiked: false,
    isMine: false,
  },
  {
    id: "2",
    author: "박지민",
    timeAgo: "4시간 전",
    content:
      "부족함이 없다는 고백이 참 감동적입니다. 세상의 기준이 아닌 주님의 은혜 안에서 자족하는 삶을 살고 싶습니다.",
    isLiked: true,
    isMine: false,
  },
  {
    id: "3",
    author: "이요셉",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCkPWy94zH3y0guyugYR2j599pBiDt7MS_D9j_XaEMH0YW1Pe-h53zXiH7ndR8eBri6IuWGbskUqWfkVoPw5kmJ999pBE70rGsZq223Ncjkt2NcDuKJ-j-RNCw6Pz-0OM3PzlpgSTwauaf_WpMFjD0Tdv8bSV3x5iPk2tPICMya6mR2EMTqxjT8Qu9PrYVbEF3Xxo23SQBtUre4kr-bMJA6m2nVwFKOExTthw_lGFBcnDqd6wcbG03k",
    timeAgo: "5시간 전",
    content:
      "내 영혼을 소생시키시는 주님, 오늘 하루도 주님의 이름으로 의의 길을 걷게 하소서. 아멘.",
    isLiked: false,
    isMine: false,
  },
];

export const sharedReflectionParticipantCount = 12;

export interface PrayerFilterTab {
  id: string;
  label: string;
}

export interface PrayerRequestItem {
  id: string;
  author: string;
  avatarUrl: string;
  timeAgo: string;
  category: string;
  content: string;
  participantCount: number;
  /** 로그인한 사용자가 올린 기도제목인지 ("나의 기도" 필터에 사용) */
  isMine: boolean;
  /** 로그인한 사용자가 이미 "함께 기도하기"를 눌렀는지 */
  hasReacted: boolean;
}

export const PRAYER_SCOPE_COMMUNITY = "우리 가교";
export const PRAYER_SCOPE_MINE = "나의 기도";

export const prayerFilterTabs: PrayerFilterTab[] = [
  { id: "all", label: "전체" },
  { id: "community", label: PRAYER_SCOPE_COMMUNITY },
  { id: "mine", label: PRAYER_SCOPE_MINE },
];

export const activePrayerFilterTabId = "all";

export const prayerRequestList: PrayerRequestItem[] = [
  {
    id: "1",
    author: "김은혜",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBek3_EgiVaswrr4i-KBN-QCGN_kX7mwpufNhga8NIQPldYTK4Sh1mN89f2fZQYmPBOqpmxAkoHLtlYrv14FIw3ybZf9eLTQJnew_slCC1akZrfR8bsMoSzmOUHHjc1-vSvnvp9_bfTlIBvW_BAY8trjEVZBVWwA0v_R3fiJpwOSuwlyanwsG_UrSG5RKrRb4xet8_BqZ_kZ6bemfa4qU3aqBPDjIOXjflAG6AwglThNOgxDh9hkotM",
    timeAgo: "2시간 전",
    category: "가정",
    content:
      "남편의 새로운 직장 적응을 위해 기도 부탁드립니다. 낯선 환경에서도 주님의 지혜로 잘 헤쳐나가고, 동료들과도 좋은 관계를 맺을 수 있도록 마음을 모아주세요.",
    participantCount: 12,
    isMine: false,
    hasReacted: false,
  },
  {
    id: "2",
    author: "박지민",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCQsq0no_H8mgz3chQpXW0Axkak-oGJK2yAGEbRwI9A-iBTQvoLB9BZ-fYdnYUvTOTW2uhjy2OXTkxgdwPW14KNXtKmo_ky7KeJo-KMDFPyPrXRlBqJmMthHqQd9y20Y853MgR2Hyu11Poy9x31OBhU1vHngd-dJxOHAtzxzVDBBY7WnccAkfF2ZMjC4vhaUzFOf6tzeeSciWcIye2uFgO10WVeCYQk1nshwf5wZtD19UyS8l2kjoNK",
    timeAgo: "어제",
    category: "건강",
    content:
      "어머니의 수술이 무사히 끝났습니다. 함께 기도해주신 모든 분들께 감사드립니다. 앞으로의 회복 과정에서도 주님의 평안이 함께하시길 계속해서 기도 부탁드립니다.",
    participantCount: 45,
    isMine: true,
    hasReacted: true,
  },
  {
    id: "3",
    author: "이소영",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAtg4diEQcggvYm4cGtjol3tejQE20GnN-Ozuw_MJ8lcER6RNKjxA1cZofMGDJauwD_691zQRS4on4cgS3mZ_lvF8UXGr1mc2g5llOyBqbbYW_L5EnS8P4VywLrArhtuM-3g2P7F1uStZndgVLOEzT8VX9f685wEiRVHWKObYtm6QCxsNtzlJsdEkZYIvvJB0Sn64Y068tGAbtLbkdwgHiFRm4Z1nb284E6NkdHsDl7tUF7KuGxP5te",
    timeAgo: "2일 전",
    category: "비전",
    content:
      "새로운 프로젝트를 기획하며 방향성에 대해 고민이 많습니다. 이 길이 주님이 기뻐하시는 길인지 분별할 수 있는 지혜를 구합니다. 과정 속에서 평안을 잃지 않도록 기도해주세요.",
    participantCount: 8,
    isMine: false,
    hasReacted: false,
  },
  {
    id: "4",
    author: "최장로",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD4rCX-lZIv4IpjcZ35GVBaiLX7nH7hKqXhGjQ2u9IcnWnDxBZWHDdqLQqP-BiZj9isbTGDOKOERQZuI1Er1Wrvwo10e3DrMP0jZRn0BtEU48WwE_vJGB4YOYqhInKXzGzcnJ7MJHP5o8mPDy7b6shKOambXq8L0FoqAgWQcC79sxkMx6YcpLqQR5N9Lgc-CVTBX87zlTeQCmwLAs6CnmnPBJ3j_YiDk8eIkeCsxn1mu6DZoS4uo5X6",
    timeAgo: "3일 전",
    category: "관계",
    content:
      "청년부 아이들과의 소통에 지혜가 필요함을 느낍니다. 세대 차이를 넘어 그리스도의 사랑으로 교제할 수 있도록, 제 마음이 먼저 열리고 따뜻해지기를 기도합니다.",
    participantCount: 21,
    isMine: false,
    hasReacted: true,
  },
];

export type CalendarEventDot = "church" | "gagyo" | "birthday" | "other";

export interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isSelected?: boolean;
  dots?: CalendarEventDot[];
  /** 공휴일이면 이름 (예: "삼일절", "대체공휴일") */
  holidayName?: string;
}

export interface CalendarMonthData {
  label: string;
  weekdayLabels: string[];
  days: CalendarDay[];
}

export type ScheduleEventType = "church" | "gagyo" | "birthday" | "other";

export interface ScheduleEvent {
  id: string;
  type: ScheduleEventType;
  title: string;
  subtitle: string;
  time?: string;
  avatarUrl?: string;
}

export const calendarProfileImageUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCNRjNItIAMrDCrsB9-hN55_z4CBnPGeNw6au_yGemzwdXzhsNiX-mYrdZZLp-LFDTfzf7rWBjYlFrGrNwgQayiokbN61wORxIWXRAOeml1mpZGQOYu2dQVkHjO0sXQPFqdT0zzF-Hl42tH_hD8l0ckPO_m4xYVlwMzmX9DHAEiISd6VAK0SAJqODVzEuF8hVDKYfBjrkqRVHBD0UWSgv9qroK7HUl9I4_E7LPP73ZdyB2efOjic2HV";

export const calendarMonth: CalendarMonthData = {
  label: "2026년 8월",
  weekdayLabels: ["일", "월", "화", "수", "목", "금", "토"],
  days: [
    // 7월 말 (이전 달)
    { date: 26, isCurrentMonth: false },
    { date: 27, isCurrentMonth: false },
    { date: 28, isCurrentMonth: false },
    { date: 29, isCurrentMonth: false },
    { date: 30, isCurrentMonth: false },
    { date: 31, isCurrentMonth: false },
    { date: 1, isCurrentMonth: true },
    // 8월 1주
    { date: 2, isCurrentMonth: true, dots: ["church"] },
    { date: 3, isCurrentMonth: true },
    { date: 4, isCurrentMonth: true },
    { date: 5, isCurrentMonth: true },
    { date: 6, isCurrentMonth: true },
    { date: 7, isCurrentMonth: true },
    { date: 8, isCurrentMonth: true },
    // 8월 2주
    { date: 9, isCurrentMonth: true, dots: ["church"] },
    { date: 10, isCurrentMonth: true },
    { date: 11, isCurrentMonth: true },
    { date: 12, isCurrentMonth: true, dots: ["birthday"] },
    { date: 13, isCurrentMonth: true },
    { date: 14, isCurrentMonth: true },
    { date: 15, isCurrentMonth: true },
    // 8월 3주
    {
      date: 16,
      isCurrentMonth: true,
      isSelected: true,
      dots: ["church", "birthday"],
    },
    { date: 17, isCurrentMonth: true },
    { date: 18, isCurrentMonth: true },
    { date: 19, isCurrentMonth: true },
    { date: 20, isCurrentMonth: true },
    { date: 21, isCurrentMonth: true },
    { date: 22, isCurrentMonth: true },
    // 8월 4주
    { date: 23, isCurrentMonth: true, dots: ["church"] },
    { date: 24, isCurrentMonth: true },
    { date: 25, isCurrentMonth: true },
    { date: 26, isCurrentMonth: true },
    { date: 27, isCurrentMonth: true },
    { date: 28, isCurrentMonth: true },
    { date: 29, isCurrentMonth: true },
    // 8월 말 ~ 9월 초
    { date: 30, isCurrentMonth: true, dots: ["church"] },
    { date: 31, isCurrentMonth: true },
    { date: 1, isCurrentMonth: false },
    { date: 2, isCurrentMonth: false },
    { date: 3, isCurrentMonth: false },
    { date: 4, isCurrentMonth: false },
    { date: 5, isCurrentMonth: false },
  ],
};

export const selectedDateLabel = "8월 16일 일정";

export const scheduleEvents: ScheduleEvent[] = [
  {
    id: "1",
    type: "church",
    title: "주일 1부 예배",
    subtitle: "대예배실",
    time: "09:00",
  },
  {
    id: "2",
    type: "birthday",
    title: "김은혜 집사님 생일",
    subtitle: "축하 메시지를 보내보세요",
    avatarUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD8_0zYYveTDupD9QLOIy6-QI0WFiLjq_gI3gPdi6ntOnBK0phUtINm1_HkX4SJHPsUaXQ3ecyvag8l-v11mBMaO4qEKoT7bcvhWCN4qUXftg7JKJQf3CwZ0kYNi7I5NReJHJg4a_0dTHNNWZpCVNDcX2l_6cd_zbjnP7-xqS8NjVwQsxUWrD62wo7yBpLZVQ0fhZUVtnXGhz0chwad0MXN1jydqBGDpQ2ELSVXThPklZs8kolcLSdM",
  },
  {
    id: "3",
    type: "church",
    title: "청년부 소그룹 모임",
    subtitle: "비전홀",
    time: "14:00",
  },
];

export interface SongDetail {
  title: string;
  artist: string;
  coverImageUrl: string;
  youtubeUrl: string;
  listenLabel: string;
}

export interface PastSong {
  id: string;
  title: string;
  coverImageUrl: string;
}

export const songDetail: SongDetail = {
  title: "그 선하신 뜻대로",
  artist: "온기 워십",
  coverImageUrl:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAlIGPdhjpQO5fiROpJMN_FdlOW_XSU2OzBB7CJNcQSi7XXM_b2KVLrDa1OrJMUgv8-wPUcKf7OW2LaZ0oB4NFzDGfqUkMLd-ptob8sznx8PBHiY-q4SzZ-o4pnGgVLAJaIafOniZDXVjeSMjXVX_wLDXT3Vb5LnlRM81t2nA5ZsOm9wfynnQebAibUiumoxpf3wLylF0A_zCc9r-HcgTgvY6evoWIlIs7PbOCbraRryjTWjMmnZ9n_",
  youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  listenLabel: "유튜브로 듣기",
};

const pastSongCoverImageUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAuGdvVhihE62VCKc4_YRybiAj3dvtwbImOANttgHWSWrbc9C-_-BJdb0UBrjq3iBP__wm88jnYImKQS-c-f5TV1H2CmNnYDHgfiPPyGOyqu2SSdpvHaTJeWvc9pY1cR2wA2hvs9pe9NZOP2mNFKRRc0QI4DzntkGt83rK35e-h3MVk16LWiM6Thyl2pX3H6anE1znbi0QCf7t8FToL8nYMgd3Y-U-NAqNjegSBtJM6IexKYnyPsBzw";

export const pastSongs: PastSong[] = [
  { id: "1", title: "주님의 품에", coverImageUrl: pastSongCoverImageUrl },
  { id: "2", title: "나의 피난처", coverImageUrl: pastSongCoverImageUrl },
  { id: "3", title: "은혜 아니면", coverImageUrl: pastSongCoverImageUrl },
  { id: "4", title: "내 영혼아", coverImageUrl: pastSongCoverImageUrl },
  { id: "5", title: "새로운 아침", coverImageUrl: pastSongCoverImageUrl },
];

export interface BiblePlanFilterChip {
  id: string;
  label: string;
}

export const biblePlanFilters: BiblePlanFilterChip[] = [
  { id: "all", label: "전체" },
  { id: "beginner", label: "처음이에요" },
  { id: "one-year", label: "1년" },
  { id: "short", label: "짧게" },
  { id: "nt-only", label: "신약만" },
];

export const activeBiblePlanFilterId = "all";

export type PlanDifficultyColor = "primary" | "error" | "secondary";
export type PlanRibbonVariant = "primary" | "secondary" | "secondary-container";

export interface BiblePlanRibbon {
  label: string;
  variant: PlanRibbonVariant;
  rotated?: boolean;
}

export interface BiblePlan {
  id: string;
  title: string;
  description: string;
  durationLabel: string;
  /** 필터링에 쓰는 원본 값 */
  totalDays: number;
  isFeatured?: boolean;
  minutesPerDay: string;
  chaptersPerDay: string;
  participantCount: number;
  difficultyFilled: number;
  difficultyColor: PlanDifficultyColor;
  ribbon?: BiblePlanRibbon;
}

export const biblePlans: BiblePlan[] = [
  {
    id: "one-year",
    title: "1년 1독",
    description: "창세기부터 요한계시록까지 차례대로",
    durationLabel: "365일",
    totalDays: 365,
    isFeatured: true,
    minutesPerDay: "하루 약 15분",
    chaptersPerDay: "하루 3-4장",
    participantCount: 24,
    difficultyFilled: 2,
    difficultyColor: "primary",
    ribbon: { label: "추천", variant: "primary", rotated: true },
  },
  {
    id: "mcheyne",
    title: "맥체인 성경읽기",
    description: "구약·신약·시편 함께 읽기",
    durationLabel: "365일",
    totalDays: 365,
    minutesPerDay: "하루 약 20분",
    chaptersPerDay: "하루 4장",
    participantCount: 12,
    difficultyFilled: 3,
    difficultyColor: "error",
  },
  {
    id: "90-day",
    title: "90일 속독",
    description: "빠른 속도로 성경 전체 흐름 파악하기",
    durationLabel: "90일",
    totalDays: 90,
    minutesPerDay: "하루 약 45분",
    chaptersPerDay: "하루 12장",
    participantCount: 8,
    difficultyFilled: 3,
    difficultyColor: "error",
  },
  {
    id: "6-month",
    title: "6개월 통독",
    description: "하루 두 번, 꾸준한 성취감을 위해",
    durationLabel: "180일",
    totalDays: 180,
    minutesPerDay: "하루 약 30분",
    chaptersPerDay: "하루 6-7장",
    participantCount: 15,
    difficultyFilled: 2,
    difficultyColor: "primary",
  },
  {
    id: "2-year",
    title: "2년 천천히",
    description: "매일 한 장씩, 깊이 있는 묵상과 함께",
    durationLabel: "730일",
    totalDays: 730,
    minutesPerDay: "하루 약 5분",
    chaptersPerDay: "하루 1장",
    participantCount: 31,
    difficultyFilled: 1,
    difficultyColor: "secondary",
    ribbon: { label: "부담 없이", variant: "secondary" },
  },
  {
    id: "nt-100",
    title: "신약 100일",
    description: "예수님의 생애와 서신서 집중 통독",
    durationLabel: "100일",
    totalDays: 100,
    minutesPerDay: "하루 약 15분",
    chaptersPerDay: "하루 3장",
    participantCount: 42,
    difficultyFilled: 1,
    difficultyColor: "secondary",
    ribbon: { label: "처음이라면", variant: "secondary-container" },
  },
];

export const bibleProgressPlanLabel = "1년 1독";

export interface BibleProgressSummary {
  percent: number;
  dayLabel: string;
  streakLabel: string;
  estimatedCompletionLabel: string;
}

export const bibleProgressSummary: BibleProgressSummary = {
  percent: 38,
  dayLabel: "138일차 / 365일",
  streakLabel: "연속 7일",
  estimatedCompletionLabel: "예상 완독 2027년 3월",
};

export interface MissedPortionAlert {
  message: string;
  catchUpLabel: string;
  restartLabel: string;
}

export const missedPortionAlert: MissedPortionAlert = {
  message: "3일치가 밀려 있어요",
  catchUpLabel: "몰아 읽기",
  restartLabel: "오늘부터 다시",
};

export interface TodayPortion {
  tag: string;
  passage: string;
  durationLabel: string;
  actionLabel: string;
  /** 완독 체크를 기록할 plan_days 행 */
  planDayId: string;
  /** 이 분량을 이미 읽음으로 표시했는지 */
  isCompleted: boolean;
}

export const todayPortion: TodayPortion = {
  planDayId: "",
  isCompleted: false,
  tag: "오늘의 분량",
  passage: "창세기 12-14장",
  durationLabel: "약 12분",
  actionLabel: "읽었어요",
};

export type WeekDayStatus = "completed" | "missed" | "today" | "future";

export interface WeekDay {
  label: string;
  status: WeekDayStatus;
}

export const weekTracker: WeekDay[] = [
  { label: "월", status: "completed" },
  { label: "화", status: "completed" },
  { label: "수", status: "missed" },
  { label: "목", status: "today" },
  { label: "금", status: "future" },
  { label: "토", status: "future" },
  { label: "일", status: "future" },
];

export interface ReadingTogether {
  avatarUrls: string[];
  extraCount: number;
  message: string;
  ctaLabel: string;
  /** 오늘 응원을 보낸 사람 수 */
  cheerCount: number;
  /** 로그인한 사용자가 오늘 이미 응원을 보냈는지 */
  hasCheeredToday: boolean;
}

export const readingTogether: ReadingTogether = {
  avatarUrls: [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC8Q1ZuCANXzl1rBBT10cJsePYDW8xYIw8RWYxDcca_fP57Ks_Y_LIm6Z2WTWK4GYJFxtTjW1IAkR_NVxRWpQdC77RhhP4tCrujJdQPsJWK7G4sIbFQphu26t52WiZ4n30O_T2CWO1QbV6UXhFhguF7t3U3mjKbQjg6kNd9eHjhb5fbHrFZD9gWg0iimifNGIzthhoDaFEx5bh2NwETmLdi66CuYWJ6vhrjnr8ZuUqumdi5v1qP_0Hp",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBQ4bYyR3IMrsNInqz_jEd5oabBvZirIlDKpLMDq4z6pLgmYzwpqqwgzp2Fc9VV4jVyfxBEySQMAMERRRWmK43vTC0dHV2bM-CYDP-ItuoHLi9bm96p9D1Oe8AFwhFr5QXC-WX9JmfIMka9cQhM8nL18fWiubahCm-G6dGmjeNm2bBsIKmxnAepnqTjq8sMoNibWbIo0rCMvd887ZDRmFrI0PLi3RkynLB5r8oVbh1WddpzWrpOM20p",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDbp2JNttguWW6inAxq3-T6GvkNZ9htXSj0LLWqsI8B4v4k8U5F6bDNtkGZQrXiaoxfK_fMhHzE0xuJJkNGc4FtfYoYZOq9Bby_-TWvmXMfUyXb0aSjw3nogl_bOhmoxf_kQ3ueobwQF_8la0mljHXFXFjBLoc8PhKpSG6tM0Sa8dXZRm35lw_peclYjlwDJUf_HMq8A9CJ5uiuQA9Z-1b1ISYciDVz6bYqVwncWCfY1AbrLlk-g3iX",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCh-yhehGjDYj_d_7hTfgKPdizKi2iT3H0FBDwKO99lbadOMXBSaB0M4KuTaD5mDtyWDxdyV7a3DPgtHQw1kZMQdkSctEmewtw84lCxCAOMiqi2SGrjVzRDxIOwSTBX3E2tEO14dTmgbstwZGb7criXhqM2WEZo3Hwu6qHtviT-gkKyzBY13ES7NdvgW-CLXBJZ53jvWSSXPhCIeqwEYSU9oTNEntiMVI6vqWqvJuIDeRwLsAaSlJF4",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDW64DAMVYknGzoI8RuIgY9A_tQ7EAwod42dqUWPr2T90Vf3-rtHqK7cXZiPlY8RVh3ghSZmloEeBGNd2LXO-9S3iED4TDlAFZgBrZQ5iC8VH2G4VUq0mWpmWHmhC_99lnp6FuWBOSw26qKwtMoUr4vI_hQpumsYXNWlHXniIIlluGPpcZFL81H4qdVoD-b-sTlY6Ke9d70tjQH9SKCr3kmNCjYmn7RsCQKqAwbgznsJ-q9TGMixAlw",
  ],
  extraCount: 12,
  message: "오늘 32명이 완독했어요",
  ctaLabel: "응원 보내기",
  cheerCount: 0,
  hasCheeredToday: false,
};

export type BookReadStatus = "completed" | "reading" | "unread";

export interface BookProgressCell {
  name?: string;
  status: BookReadStatus;
  readingPercent?: number;
}

export interface TestamentProgress {
  label: string;
  books: BookProgressCell[];
}

export type RegistrationStatusIcon = "devotion" | "song" | "groupMaterial";

export interface RegistrationStatusItem {
  id: string;
  label: string;
  icon: RegistrationStatusIcon;
  isRegistered: boolean;
  href?: string;
}

export const todayRegistrationStatus: RegistrationStatusItem[] = [
  {
    id: "devotion",
    label: "묵상",
    icon: "devotion",
    isRegistered: true,
    href: "/devotion",
  },
  {
    id: "song",
    label: "찬양",
    icon: "song",
    isRegistered: true,
    href: "/song",
  },
  {
    id: "groupMaterial",
    label: "교제자료",
    icon: "groupMaterial",
    isRegistered: false,
    href: "/admin/group-material",
  },
];

export type QuickManagementIcon =
  | "devotion"
  | "song"
  | "groupMaterial"
  | "calendar"
  | "memberApproval"
  | "notification";

export interface QuickManagementAction {
  id: string;
  label: string;
  icon: QuickManagementIcon;
  /** 이동할 페이지 경로. 없으면 아직 연결할 화면이 없는 액션. */
  href?: string;
}

export const quickManagementActions: QuickManagementAction[] = [
  { id: "devotion", label: "묵상 등록", icon: "devotion", href: "/admin/devotion/new" },
  { id: "song", label: "찬양 등록", icon: "song", href: "/admin/song/new" },
  {
    id: "groupMaterial",
    label: "교제 자료 등록",
    icon: "groupMaterial",
    href: "/admin/group-material",
  },
  { id: "calendar", label: "일정 등록", icon: "calendar", href: "/admin/event/new" },
  {
    id: "memberApproval",
    label: "교인 승인",
    icon: "memberApproval",
    href: "#pending-approval",
  },
];

export interface PendingMember {
  id: string;
  name: string;
  groupName: string;
  phone: string;
  appliedLabel: string;
}

export const pendingMembers: PendingMember[] = [
  {
    id: "1",
    name: "이하은",
    groupName: "1가교",
    phone: "010-1234-5678",
    appliedLabel: "오늘 09:12 신청",
  },
  {
    id: "2",
    name: "박지훈",
    groupName: "은혜가교",
    phone: "010-2345-6789",
    appliedLabel: "어제 18:45 신청",
  },
];

export interface ScheduledNotification {
  title: string;
  scheduleLabel: string;
}

export const scheduledNotification: ScheduledNotification = {
  title: "금요 철야 예배 안내",
  scheduleLabel: "오늘 오후 6:00 발송 예정",
};

export type GroupTabId = "bulletin" | "manuscript" | "praise";

export interface GroupTab {
  id: GroupTabId;
  label: string;
}

export const groupTabs: GroupTab[] = [
  { id: "bulletin", label: "주보" },
  { id: "manuscript", label: "설교안" },
  { id: "praise", label: "찬양악보" },
];

export const activeGroupTabId: GroupTabId = "bulletin";

export const groupMeetingTitle = "가교모임 (2월 11일)";

export interface PraiseSheet {
  id: string;
  key: string;
  title: string;
  sheetUrl: string | null;
}

export const praiseSheets: PraiseSheet[] = [
  { id: "1", key: "G Key", title: "주님 마음 내게 주소서", sheetUrl: null },
  { id: "2", key: "F Key", title: "예배합니다", sheetUrl: null },
];

export type MoreMenuIcon = "admin" | "biblePlan";

export interface MoreMenuItem {
  id: string;
  label: string;
  description: string;
  icon: MoreMenuIcon;
  href: string;
}

export const moreMenuItems: MoreMenuItem[] = [
  {
    id: "admin",
    label: "콘텐츠 관리",
    description: "관리자 전용 도구",
    icon: "admin",
    href: "/admin",
  },
  {
    id: "biblePlan",
    label: "통독 플랜 선택",
    description: "성경 읽기 계획을 바꿔보세요",
    icon: "biblePlan",
    href: "/bible-plan-select",
  },
];
