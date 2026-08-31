export function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function blocksToLines(text: string): string[][] {
  return text
    .split(/\n\s*\n/)
    .map((block) => linesToArray(block))
    .filter((block) => block.length > 0);
}

export function arrayToLines(arr: string[]): string {
  return arr.join("\n");
}

export function linesToBlocks(blocks: string[][]): string {
  return blocks.map((block) => block.join("\n")).join("\n\n");
}

export interface ParsedVerse {
  number: number;
  text: string;
}

/**
 * 말씀 내용 입력칸(한 줄에 한 절)을 절 배열로 바꾼다.
 *
 * 줄마다 앞에 절 번호를 붙일 수 있다("5 이집트 땅에 있는..."). 모든 줄에
 * 번호가 붙어 있을 때만 그 번호를 쓰고, 하나라도 없으면 위에서부터 1, 2, 3...으로 센다.
 * 5절부터 시작하는 본문을 편집하고 저장했을 때 번호가 1부터 다시 매겨지지 않게 하려는 것.
 */
export function linesToVerses(lines: string[]): ParsedVerse[] {
  const matches = lines.map((line) => line.match(/^(\d{1,3})[.)]?\s+(.+)$/));
  const allNumbered = lines.length > 0 && matches.every((match) => match !== null);

  return lines.map((line, index) => {
    const match = matches[index];
    return allNumbered && match
      ? { number: Number(match[1]), text: match[2].trim() }
      : { number: index + 1, text: line };
  });
}

/** 절 배열을 "5 이집트 땅에 있는..." 모양의 입력칸 내용으로 되돌린다. */
export function versesToLines(verses: ParsedVerse[]): string {
  return verses.map((verse) => `${verse.number} ${verse.text}`).join("\n");
}
