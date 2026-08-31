/**
 * 앱 사용 가이드에 들어가는 내용.
 *
 * 화면(GuideDoc)은 이 파일의 순서대로 그대로 그린다.
 * 기능이나 문구가 바뀌면 이 파일만 고치면 된다.
 */

/** 성도들에게 안내하는 앱 주소. 주소가 바뀌면 여기만 고치면 된다. */
export const GUIDE_APP_URL = "https://somang-gagyo.vercel.app";

/** 화면에 보여줄 때는 https:// 없이 짧게 보여준다. */
export const GUIDE_APP_HOST = "somang-gagyo.vercel.app";

export type GuideChapterId =
  | "install"
  | "start"
  | "home"
  | "song"
  | "devotion"
  | "bible"
  | "prayer"
  | "group"
  | "more";

/** 장 제목 옆 아이콘. GuideDoc에서 실제 아이콘으로 바뀐다. */
export type GuideIcon =
  | "smartphone"
  | "login"
  | "home"
  | "music"
  | "book"
  | "bookMarked"
  | "hand"
  | "users"
  | "more";

export interface GuideChapter {
  id: GuideChapterId;
  /** 위쪽 목차 칩에 들어가는 짧은 이름 */
  label: string;
  /** 본문 제목 */
  title: string;
  /** 제목 아래 한 줄 요약 */
  lead: string;
  icon: GuideIcon;
}

export interface GuideBlock {
  id: string;
  chapterId: GuideChapterId;
  title: string;
  /** 제목 아래 설명 문단 */
  body?: string;
  /** 번호가 붙는 순서 (설치처럼 차례대로 따라 해야 하는 내용) */
  steps?: string[];
  /** 번호 없이 나열하는 항목 */
  points?: string[];
  /** 블록 아래 안내 상자 */
  tip?: { label: string; text: string };
  /** 앱 주소를 크게 보여주고 복사할 수 있게 한다 */
  showAddress?: boolean;
}

export const guideChapters: GuideChapter[] = [
  {
    id: "install",
    label: "설치",
    title: "휴대폰에 설치하기",
    lead: "앱 스토어에서 내려받지 않아요. 브라우저로 한 번 접속해 홈 화면에 추가하면 그때부터 아이콘으로 열립니다.",
    icon: "smartphone",
  },
  {
    id: "start",
    label: "시작",
    title: "로그인과 승인",
    lead: "처음 한 번만 거치면 됩니다. 그 뒤로는 아이콘을 누르면 바로 열려요.",
    icon: "login",
  },
  {
    id: "home",
    label: "홈",
    title: "홈 탭",
    lead: "오늘 해야 할 것이 한 화면에 모여 있어요.",
    icon: "home",
  },
  {
    id: "song",
    label: "찬양",
    title: "찬양 탭",
    lead: "이번주 찬양콘티와 추천찬양, 두 개의 메뉴가 있어요.",
    icon: "music",
  },
  {
    id: "devotion",
    label: "묵상",
    title: "묵상 탭",
    lead: "오늘 본문을 읽고, 질문을 따라 묵상하고, 나눔을 남기는 곳이에요.",
    icon: "book",
  },
  {
    id: "bible",
    label: "통독",
    title: "통독 탭",
    lead: "성경 읽기 계획을 정하고 매일 읽은 만큼 표시하며 진도를 쌓아요.",
    icon: "bookMarked",
  },
  {
    id: "prayer",
    label: "기도",
    title: "기도 탭",
    lead: "기도제목을 나누고, 서로의 기도에 함께하는 곳이에요.",
    icon: "hand",
  },
  {
    id: "group",
    label: "교제",
    title: "교제 탭",
    lead: "가교모임에 필요한 자료가 날짜별로 모여 있어요.",
    icon: "users",
  },
  {
    id: "more",
    label: "더보기",
    title: "더보기 탭",
    lead: "공지사항, 내 프로필, 멤버 목록, 알림 설정이 모여 있어요.",
    icon: "more",
  },
];

export const guideBlocks: GuideBlock[] = [
  {
    id: "install-why",
    chapterId: "install",
    title: "먼저 이 주소로 접속해요",
    body: "브라우저 주소창에 아래 주소를 입력해 접속한 뒤, 홈 화면에 추가하면 다른 앱처럼 아이콘으로 열립니다.",
    showAddress: true,
    points: [
      "매번 주소를 치지 않고 아이콘 한 번으로 열려요.",
      "주소창이 사라져 화면이 넓어져요.",
      "공지·묵상 알림을 받을 수 있어요. 아이폰은 홈 화면에 추가해야만 알림이 와요.",
    ],
  },
  {
    id: "install-android",
    chapterId: "install",
    title: "안드로이드 · 크롬으로 설치하기",
    steps: [
      "크롬 앱 주소창에 somang-gagyo.vercel.app 을 입력해 접속해요.",
      "아래에 '앱 설치' 안내가 뜨면 눌러요. 안 뜨면 다음으로 넘어가세요.",
      "오른쪽 위 점 세 개(⋮)를 눌러요.",
      "'홈 화면에 추가' 또는 '앱 설치'를 골라요.",
      "이름이 소망가교인지 확인하고 '설치'를 눌러요.",
    ],
    tip: {
      label: "삼성 인터넷이라면",
      text: "아래 메뉴(≡) → 현재 페이지 추가 → 홈 화면 순서로 똑같이 하면 돼요.",
    },
  },
  {
    id: "install-iphone",
    chapterId: "install",
    title: "아이폰 · 사파리로 설치하기",
    steps: [
      "사파리 주소창에 somang-gagyo.vercel.app 을 입력해 접속해요.",
      "화면 아래 가운데 공유 버튼(위로 향한 화살표)을 눌러요.",
      "목록을 아래로 쓸어내려 '홈 화면에 추가'를 찾아요.",
      "이름을 확인하고 오른쪽 위 '추가'를 눌러요.",
    ],
    tip: {
      label: "아이폰에서 크롬을 쓴다면",
      text: "크롬에서도 공유 버튼 → 홈 화면에 추가가 돼요. 다만 알림까지 받으려면 사파리로 추가한 아이콘이 안전해요.",
    },
  },
  {
    id: "install-check",
    chapterId: "install",
    title: "잘 됐는지 확인해요",
    body: "홈 화면 아이콘을 눌렀을 때 위쪽에 주소창이 보이지 않으면 제대로 설치된 거예요.",
    tip: {
      label: "주소창이 그대로 보이면",
      text: "즐겨찾기만 추가된 상태예요. 위 순서를 한 번 더 해보세요.",
    },
  },
  {
    id: "start-login",
    chapterId: "start",
    title: "가입 순서",
    steps: [
      "'Google로 로그인'을 눌러 계정을 골라요.",
      "관리자가 알아볼 수 있도록 실명, 소속 가교, 연락처를 입력해요.",
      "승인 대기 화면이 나오고, 관리자에게 신청 알림이 자동으로 가요.",
      "승인되면 앱을 다시 열었을 때 홈 화면이 보여요.",
    ],
    tip: {
      label: "승인이 늦어지면",
      text: "앱을 껐다 켜보시고, 그래도 대기 화면이면 교회 사무실이나 가교장께 말씀해 주세요.",
    },
  },
  {
    id: "start-tabs",
    chapterId: "start",
    title: "화면 아래 일곱 개의 탭",
    body: "모든 기능은 화면 맨 아래 탭에 나뉘어 있어요.",
    points: [
      "홈 · 오늘 할 것이 한 화면에",
      "찬양 · 콘티와 추천찬양",
      "묵상 · 오늘 본문과 나눔",
      "통독 · 성경 읽기 진도",
      "기도 · 기도제목 나누기",
      "교제 · 가교모임 자료",
      "더보기 · 공지와 설정",
    ],
  },
  {
    id: "home-top",
    chapterId: "home",
    title: "인사와 공지 배너",
    points: [
      "이름과 함께 '○일째 함께하고 있어요'가 떠요. 가입한 날부터 센 날수예요.",
      "공지 배너는 최근 공지를 몇 초에 하나씩 돌아가며 보여줘요.",
      "배너를 누르면 그 공지 내용으로 바로 들어가요.",
    ],
  },
  {
    id: "home-cards",
    chapterId: "home",
    title: "오늘의 카드들",
    points: [
      "오늘의 묵상 · 누르면 묵상 탭으로 가요.",
      "말씀 읽기 · 카드에서 바로 '읽기 완료 표시'를 눌러요.",
      "찬양 · 이번주 찬양콘티와 추천찬양이 번갈아 바뀌고, 누르면 그 메뉴가 열려요.",
      "기도제목 · 최근 올라온 기도제목을 돌아가며 보여줘요.",
      "다가오는 일정 · 누르면 달력 화면으로 넘어가요.",
    ],
    tip: {
      label: "달력은 여기서",
      text: "교회 일정 달력은 홈의 '다가오는 일정' 카드를 눌러 들어가요.",
    },
  },
  {
    id: "song-set",
    chapterId: "song",
    title: "이번주 찬양콘티",
    body: "이번 주 예배에서 부를 찬양 순서예요. 사진이나 유튜브 링크로 올릴 수 있어요.",
    steps: [
      "사진은 '콘티 사진 올리기'를 눌러 휴대폰 사진을 골라요.",
      "영상은 '유튜브 링크'를 눌러 주소를 붙여넣고 '링크 추가'를 눌러요.",
      "내가 올린 콘티는 휴지통 아이콘으로 지워요.",
    ],
    tip: {
      label: "이번 주 콘티가 아직 없을 때",
      text: "지난주 콘티를 대신 보여주고 '지난 찬양콘티'라고 알려줘요.",
    },
  },
  {
    id: "song-recommend",
    chapterId: "song",
    title: "추천찬양",
    points: [
      "'유튜브로 듣기'를 누르면 유튜브가 열려요.",
      "가사가 등록된 곡은 아래에서 가사를 함께 볼 수 있어요.",
      "맨 아래 '지난 찬양'은 옆으로 넘겨 보고, 곡을 누르면 그 곡의 유튜브가 열려요.",
    ],
  },
  {
    id: "devotion-read",
    chapterId: "devotion",
    title: "오늘 본문 읽기",
    points: [
      "맨 위에 오늘 본문과 제목, 그 아래 말씀이 절 번호와 함께 이어져요.",
      "구절 끝에 작은 글자(a, b …)가 보이면 눌러보세요. 그 구절에 대한 설명이 아래에 펼쳐져요.",
      "말씀 아래에는 묵상 해설과 기도, '오늘 살기' 한 줄이 함께 있어요.",
      "묵상 질문 세 개가 준비되어 있어요.",
      "오른쪽 위 공유 버튼으로 오늘 묵상을 카카오톡 등으로 보낼 수 있어요.",
    ],
  },
  {
    id: "devotion-share",
    chapterId: "devotion",
    title: "나눔 남기기",
    steps: [
      "'나의 묵상 나눔' 칸에 오늘 받은 은혜를 적어요.",
      "'나눔 남기기'를 누르면 아래 '함께한 나눔'에 올라가요.",
      "다른 분의 나눔에는 하트를 눌러 마음을 표현해요.",
      "내가 쓴 나눔은 휴지통 아이콘으로 지워요.",
    ],
  },
  {
    id: "bible-plan",
    chapterId: "bible",
    title: "먼저 플랜을 골라요",
    body: "아직 시작한 플랜이 없으면 '플랜 선택하러 가기'가 떠요. 나중에 바꾸려면 더보기 → 통독 플랜 선택에서 고르면 됩니다.",
    tip: {
      label: "여러 플랜도 괜찮아요",
      text: "플랜을 동시에 여러 개 진행할 수 있고, 통독 화면 위쪽 탭으로 오가요.",
    },
  },
  {
    id: "bible-daily",
    chapterId: "bible",
    title: "매일 하는 일",
    points: [
      "오늘 분량을 읽고 '완독 표시'를 눌러요. 잘못 눌렀으면 다시 눌러 취소해요.",
      "주간 트래커에서 이번 주 어느 요일을 읽었는지 한눈에 봐요.",
      "아래로 내리면 구약·신약 전체 진도가 보여요.",
    ],
  },
  {
    id: "bible-missed",
    chapterId: "bible",
    title: "밀렸을 때, 쉬어야 할 때",
    points: [
      "며칠 밀리면 '모두 읽은 것으로 표시' 또는 '건너뛰고 오늘부터'를 고를 수 있어요.",
      "잠시 멈춰야 하면 아래 통독 관리에서 '일시중지'를 눌러요.",
      "'다시 시작'은 완독 기록을 모두 지우니 신중히 눌러주세요.",
    ],
  },
  {
    id: "bible-cheer",
    chapterId: "bible",
    title: "함께 읽는 사람 응원하기",
    body: "같은 플랜을 읽는 가교 식구들이 보여요. 응원을 보내면 그분들에게 알림이 갑니다.",
    tip: { label: "하루 한 번", text: "응원은 하루에 한 번 보낼 수 있어요." },
  },
  {
    id: "prayer-write",
    chapterId: "prayer",
    title: "기도제목 올리기",
    steps: [
      "오른쪽 위 + 버튼을 눌러요.",
      "기도제목과 감사 중에서 골라요. 감사로 올리면 '감사' 배지가 붙어요.",
      "'우리 가교'는 함께 나눌 기도, '나의 기도'는 개인 기도예요.",
      "내용을 적고 '기도제목 올리기'를 눌러요.",
    ],
  },
  {
    id: "prayer-together",
    chapterId: "prayer",
    title: "서로의 기도에 함께하기",
    points: [
      "'함께 기도하기'를 누르면 참여 인원이 늘어나요. 다시 누르면 취소돼요.",
      "오른쪽 하트는 글에 마음을 표현하는 좋아요예요. 기도 참여와는 따로 세요.",
      "위쪽 전체 · 우리 가교 · 나의 기도 탭으로 골라 볼 수 있어요.",
      "내가 올린 기도제목은 휴지통으로 지워요.",
    ],
  },
  {
    id: "group-date",
    chapterId: "group",
    title: "날짜 고르기",
    body: "기본은 오늘 날짜예요. 지난 주 자료를 보려면 오른쪽 위 달력 아이콘을 눌러 날짜를 고르세요.",
  },
  {
    id: "group-tabs",
    chapterId: "group",
    title: "네 개의 메뉴",
    points: [
      "주보 · 그 주 주보를 사진으로 봐요.",
      "설교안 · 설교 원고 자료를 봐요.",
      "설교요약 · 나눔을 위한 요약이에요. 직접 입력해 올릴 수 있어요.",
      "찬양악보 · '악보 사진 추가'로 악보를 올려요.",
    ],
  },
  {
    id: "more-announcement",
    chapterId: "more",
    title: "공지사항",
    points: [
      "읽으셨으면 '확인했어요'를 눌러주세요. 몇 분이 확인했는지 함께 보여요.",
      "투표 공지는 항목을 고르고 '투표 완료'를 눌러요. 마감 전이면 수정할 수 있어요.",
      "공지마다 댓글을 남길 수 있어요.",
      "공지 화면 위쪽 '목록'을 누르면 공지 목록으로 돌아가요.",
    ],
    tip: {
      label: "공지 수정은 올린 사람만",
      text: "다른 분이 올린 공지를 고쳐야 하면 그분께 부탁해 주세요.",
    },
  },
  {
    id: "more-bell",
    chapterId: "more",
    title: "알림 받기",
    steps: [
      "더보기에서 '알림 받기'를 눌러요.",
      "브라우저가 묻는 알림 허용에 '허용'을 눌러요.",
      "'알림 받는 중 · 끄기'로 바뀌면 설정된 거예요.",
    ],
    tip: {
      label: "버튼이 안 보이거나 눌리지 않으면",
      text: "아이폰은 홈 화면 아이콘으로 연 상태여야 알림을 받을 수 있어요. 설치 부분부터 다시 해주세요.",
    },
  },
  {
    id: "more-etc",
    chapterId: "more",
    title: "프로필과 멤버, 공유",
    points: [
      "내 프로필에서 사진과 이름을 바꿔요. 기도·나눔 글에 함께 보여요.",
      "멤버 목록에서 이름이나 가교로 검색할 수 있어요.",
      "'앱 공유하기'로 새로 오신 분께 주소를 보낼 수 있어요.",
      "'콘텐츠 관리'는 관리자에게만 열려요.",
    ],
  },
];

export interface GuideFaqItem {
  question: string;
  answer: string;
}

export const guideFaq: GuideFaqItem[] = [
  {
    question: "앱 스토어에서 소망가교를 찾을 수 없어요.",
    answer:
      "스토어에는 올라가 있지 않아요. 브라우저로 접속해 홈 화면에 추가하는 방식이라, 위 설치 부분대로 하시면 아이콘이 생겨요.",
  },
  {
    question: "화면이 이상하게 나오거나 예전 내용이 보여요.",
    answer:
      "앱을 완전히 껐다가 다시 열어보세요. 그래도 그대로면 화면을 아래로 당겨 새로고침 해주세요.",
  },
  {
    question: "실수로 올린 글을 지우고 싶어요.",
    answer:
      "기도제목·묵상 나눔·댓글·악보처럼 내가 올린 것에는 휴지통 아이콘이 보여요. 누르면 확인 후 지워집니다.",
  },
  {
    question: "휴대폰을 바꿨어요. 기록이 사라지나요?",
    answer:
      "기록은 계정에 저장돼요. 새 휴대폰에서 같은 구글 계정으로 로그인하면 통독 진도와 나눔이 그대로 이어집니다. 홈 화면에 추가하는 것만 다시 해주세요.",
  },
];
