/**
 * 가사 검색어에서 괄호(그 안 내용 포함)·영어·특수기호를 지우고
 * 한글·숫자·공백만 남긴다. "그 크신 주의 사랑 (Reprise ver.)" 같은
 * 제목도 "그 크신 주의 사랑"처럼 깔끔한 검색어로 만들어 준다.
 *
 * 완전히 영어로만 된 제목(예: "Way Maker")은 이렇게 걸러내면 검색어가
 * 아예 비거나 숫자만 남을 수 있어서, 한글이 하나도 안 남으면 괄호만
 * 정리한 원문으로 대신한다.
 */
export function cleanSearchQuery(text: string): string {
  const stripBrackets = (value: string) =>
    value.replace(/[(\[{<（【][^)\]}>）】]*[)\]}>）】]?/g, " ");

  const cleaned = stripBrackets(text)
    .replace(/[^가-힣0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (/[가-힣]/.test(cleaned)) return cleaned;

  return stripBrackets(text).replace(/\s+/g, " ").trim();
}

/** 곡 제목·아티스트로 네이버 가사 검색 URL을 만든다. */
export function buildLyricsSearchUrl(title: string, artist: string): string {
  const query = `${cleanSearchQuery(title)} ${cleanSearchQuery(artist)} 가사`
    .replace(/\s+/g, " ")
    .trim();

  return `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`;
}
