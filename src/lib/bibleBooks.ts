/**
 * 성경 66권 메타데이터와 통독 분량(passage) 문자열 파서.
 * plan_days.passage 는 "창세기 1-4장", "레위기 1-2장 / 시편 49-50편 / 사도행전 2-3장"
 * 처럼 쉼표 또는 슬래시로 구분된 "책이름 시작-끝장" 형태로 저장된다.
 */

export type Testament = "old" | "new";

export interface BibleBook {
  name: string;
  chapters: number;
  testament: Testament;
}

export const BIBLE_BOOKS: BibleBook[] = [
  { name: "창세기", chapters: 50, testament: "old" },
  { name: "출애굽기", chapters: 40, testament: "old" },
  { name: "레위기", chapters: 27, testament: "old" },
  { name: "민수기", chapters: 36, testament: "old" },
  { name: "신명기", chapters: 34, testament: "old" },
  { name: "여호수아", chapters: 24, testament: "old" },
  { name: "사사기", chapters: 21, testament: "old" },
  { name: "룻기", chapters: 4, testament: "old" },
  { name: "사무엘상", chapters: 31, testament: "old" },
  { name: "사무엘하", chapters: 24, testament: "old" },
  { name: "열왕기상", chapters: 22, testament: "old" },
  { name: "열왕기하", chapters: 25, testament: "old" },
  { name: "역대상", chapters: 29, testament: "old" },
  { name: "역대하", chapters: 36, testament: "old" },
  { name: "에스라", chapters: 10, testament: "old" },
  { name: "느헤미야", chapters: 13, testament: "old" },
  { name: "에스더", chapters: 10, testament: "old" },
  { name: "욥기", chapters: 42, testament: "old" },
  { name: "시편", chapters: 150, testament: "old" },
  { name: "잠언", chapters: 31, testament: "old" },
  { name: "전도서", chapters: 12, testament: "old" },
  { name: "아가", chapters: 8, testament: "old" },
  { name: "이사야", chapters: 66, testament: "old" },
  { name: "예레미야", chapters: 52, testament: "old" },
  { name: "예레미야애가", chapters: 5, testament: "old" },
  { name: "에스겔", chapters: 48, testament: "old" },
  { name: "다니엘", chapters: 12, testament: "old" },
  { name: "호세아", chapters: 14, testament: "old" },
  { name: "요엘", chapters: 3, testament: "old" },
  { name: "아모스", chapters: 9, testament: "old" },
  { name: "오바댜", chapters: 1, testament: "old" },
  { name: "요나", chapters: 4, testament: "old" },
  { name: "미가", chapters: 7, testament: "old" },
  { name: "나훔", chapters: 3, testament: "old" },
  { name: "하박국", chapters: 3, testament: "old" },
  { name: "스바냐", chapters: 3, testament: "old" },
  { name: "학개", chapters: 2, testament: "old" },
  { name: "스가랴", chapters: 14, testament: "old" },
  { name: "말라기", chapters: 4, testament: "old" },
  { name: "마태복음", chapters: 28, testament: "new" },
  { name: "마가복음", chapters: 16, testament: "new" },
  { name: "누가복음", chapters: 24, testament: "new" },
  { name: "요한복음", chapters: 21, testament: "new" },
  { name: "사도행전", chapters: 28, testament: "new" },
  { name: "로마서", chapters: 16, testament: "new" },
  { name: "고린도전서", chapters: 16, testament: "new" },
  { name: "고린도후서", chapters: 13, testament: "new" },
  { name: "갈라디아서", chapters: 6, testament: "new" },
  { name: "에베소서", chapters: 6, testament: "new" },
  { name: "빌립보서", chapters: 4, testament: "new" },
  { name: "골로새서", chapters: 4, testament: "new" },
  { name: "데살로니가전서", chapters: 5, testament: "new" },
  { name: "데살로니가후서", chapters: 3, testament: "new" },
  { name: "디모데전서", chapters: 6, testament: "new" },
  { name: "디모데후서", chapters: 4, testament: "new" },
  { name: "디도서", chapters: 3, testament: "new" },
  { name: "빌레몬서", chapters: 1, testament: "new" },
  { name: "히브리서", chapters: 13, testament: "new" },
  { name: "야고보서", chapters: 5, testament: "new" },
  { name: "베드로전서", chapters: 5, testament: "new" },
  { name: "베드로후서", chapters: 3, testament: "new" },
  { name: "요한일서", chapters: 5, testament: "new" },
  { name: "요한이서", chapters: 1, testament: "new" },
  { name: "요한삼서", chapters: 1, testament: "new" },
  { name: "유다서", chapters: 1, testament: "new" },
  { name: "요한계시록", chapters: 22, testament: "new" },
];

export const OLD_TESTAMENT_BOOKS = BIBLE_BOOKS.filter(
  (book) => book.testament === "old",
);
export const NEW_TESTAMENT_BOOKS = BIBLE_BOOKS.filter(
  (book) => book.testament === "new",
);

const BOOK_BY_NAME = new Map(BIBLE_BOOKS.map((book) => [book.name, book]));

/** 축약형·표기 흔들림을 정식 책 이름으로 맞춰준다. */
const BOOK_ALIASES: Record<string, string> = {
  창: "창세기",
  출: "출애굽기",
  레: "레위기",
  민: "민수기",
  신: "신명기",
  "예레미야 애가": "예레미야애가",
  애가: "예레미야애가",
  아가서: "아가",
  잠언서: "잠언",
  시: "시편",
  욥: "욥기",
  룻: "룻기",
  "요한 1서": "요한일서",
  "요한 2서": "요한이서",
  "요한 3서": "요한삼서",
  요한1서: "요한일서",
  요한2서: "요한이서",
  요한3서: "요한삼서",
  계시록: "요한계시록",
};

export function resolveBookName(rawName: string): string | null {
  const name = rawName.replace(/\s+/g, " ").trim();
  const canonical = BOOK_ALIASES[name] ?? name;
  return BOOK_BY_NAME.has(canonical) ? canonical : null;
}

export function getBookChapters(name: string): number | null {
  return BOOK_BY_NAME.get(name)?.chapters ?? null;
}

/** "창세기 1-4장" 형태의 한 구간. 슬래시/쉼표로 나눈 뒤 각각을 파싱한다. */
const SEGMENT_PATTERN = /^(.+?)\s*(\d+)\s*(?:[-~]\s*(\d+))?\s*[장편]?$/;

export interface ParsedPassage {
  book: string;
  startChapter: number;
  endChapter: number;
}

/** 분량 문자열을 책·장 범위 목록으로 변환한다. 해석하지 못한 구간은 건너뛴다. */
export function parsePassage(passage: string): ParsedPassage[] {
  if (!passage) return [];

  return passage
    .split(/[,/]/)
    .map((segment) => segment.trim())
    .filter(Boolean)
    .flatMap((segment) => {
      const match = SEGMENT_PATTERN.exec(segment);
      if (!match) return [];

      const book = resolveBookName(match[1]);
      if (!book) return [];

      const totalChapters = getBookChapters(book) ?? 0;
      const startChapter = Number(match[2]);
      const endChapter = match[3] ? Number(match[3]) : startChapter;

      if (
        !Number.isFinite(startChapter) ||
        !Number.isFinite(endChapter) ||
        startChapter < 1 ||
        endChapter < startChapter
      ) {
        return [];
      }

      return [
        {
          book,
          startChapter,
          endChapter: Math.min(endChapter, totalChapters || endChapter),
        },
      ];
    });
}

/** 여러 분량 문자열에서 책별로 읽은 장 번호 집합을 만든다. */
export function collectReadChapters(passages: string[]): Map<string, Set<number>> {
  const readChapters = new Map<string, Set<number>>();

  for (const passage of passages) {
    for (const { book, startChapter, endChapter } of parsePassage(passage)) {
      let chapters = readChapters.get(book);
      if (!chapters) {
        chapters = new Set<number>();
        readChapters.set(book, chapters);
      }
      for (let chapter = startChapter; chapter <= endChapter; chapter += 1) {
        chapters.add(chapter);
      }
    }
  }

  return readChapters;
}
