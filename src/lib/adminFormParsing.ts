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
