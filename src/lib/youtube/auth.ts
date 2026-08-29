import { getAccessToken } from "./getAccessToken";

/**
 * 공개 재생목록을 읽을 때 쓰는 API 키.
 * OAuth refresh token과 달리 만료되지 않아서, 이 키만 있으면
 * 추천찬양·찬양콘티 재생목록은 유튜브 재인증 없이 계속 동작한다.
 */
export function youtubeApiKey() {
  return process.env.YOUTUBE_API_KEY?.trim() || null;
}

export interface YoutubeAuth {
  headers: HeadersInit;
  /** 요청 주소에 붙일 API 키. OAuth로 인증했으면 null. */
  apiKey: string | null;
}

/** API 키가 있으면 주소에 붙여준다. */
export function withAuth(url: URL, auth: YoutubeAuth) {
  if (auth.apiKey) {
    url.searchParams.set("key", auth.apiKey);
  }
  return url;
}

/**
 * 공개 데이터(공개 재생목록의 곡 목록 등)를 읽을 때 쓴다.
 * API 키를 먼저 쓰고, 없을 때만 OAuth로 넘어간다.
 */
export async function publicYoutubeAuth(): Promise<YoutubeAuth> {
  const apiKey = youtubeApiKey();
  if (apiKey) {
    return { headers: {}, apiKey };
  }

  return personalYoutubeAuth();
}

/**
 * 관리자 계정의 개인 데이터(좋아요 표시한 동영상, 내 재생목록 목록)를 읽을 때 쓴다.
 * 이 데이터는 API 키로는 볼 수 없어 OAuth가 반드시 필요하다.
 */
export async function personalYoutubeAuth(): Promise<YoutubeAuth> {
  const accessToken = await getAccessToken();
  return { headers: { Authorization: `Bearer ${accessToken}` }, apiKey: null };
}
