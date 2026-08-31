import { linesToArray } from "@/lib/adminFormParsing";

/**
 * QT 묵상의 해설·각주를 관리자 입력칸(텍스트 영역)과 DB(jsonb) 사이에서 옮긴다.
 * 입력칸 형식은 관리자가 사진과 대조하며 손으로 고치기 쉬운 모양을 우선했다.
 */

export interface CommentarySection {
  heading: string;
  body: string;
}

export interface DevotionFootnote {
  marker: string;
  text: string;
  verse: number | null;
}

/**
 * 해설 입력칸 형식 : 빈 줄로 나뉜 덩어리마다 첫 줄이 소제목, 나머지가 본문.
 *
 *   성경 속의 하나님 나라
 *   이제 마지막 한 가지 재앙만 남았습니다. ...
 *
 *   지금 이곳의 하나님 나라
 *   신앙인도 세상과 같은 무대에서 ...
 */
export function commentaryToText(sections: CommentarySection[]): string {
  return sections
    .map((section) => `${section.heading}\n${section.body}`)
    .join("\n\n");
}

export function textToCommentary(text: string): CommentarySection[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => linesToArray(block))
    .filter((lines) => lines.length > 0)
    .map((lines) => {
      // 소제목만 있고 본문이 없으면 통째로 본문으로 본다.
      if (lines.length === 1) {
        return { heading: "묵상", body: lines[0] };
      }
      return { heading: lines[0], body: lines.slice(1).join("\n") };
    });
}

/**
 * 각주 입력칸 형식 : 한 줄에 하나, "표시) 내용 (N절)".
 *
 *   a) 오랜 종살이의 정당한 품삯과 같다. (2절)
 */
export function footnotesToText(footnotes: DevotionFootnote[]): string {
  return footnotes
    .map((footnote) => {
      const verse = footnote.verse ? ` (${footnote.verse}절)` : "";
      return `${footnote.marker}) ${footnote.text}${verse}`;
    })
    .join("\n");
}

export function textToFootnotes(text: string): DevotionFootnote[] {
  return linesToArray(text).map((line) => {
    const marked = line.match(/^([A-Za-z0-9가-힣]{1,3})\s*[).:]\s*(.+)$/);
    const marker = marked ? marked[1] : "";
    const rest = marked ? marked[2] : line;

    // 끝에 붙은 "(7절)"은 절 번호로 떼어낸다.
    const versed = rest.match(/^(.*?)\s*\((\d{1,3})\s*절\)\s*$/);

    return {
      marker,
      text: (versed ? versed[1] : rest).trim(),
      verse: versed ? Number(versed[2]) : null,
    };
  });
}
