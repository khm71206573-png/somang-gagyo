import { HttpError } from "@/lib/automation/HttpError";

const TOKEN_URL = "https://oauth2.googleapis.com/token";

/**
 * refresh token이 만료·해제되면 구글이 invalid_grant를 돌려준다.
 * (OAuth 동의 화면이 "테스트" 상태면 7일마다 만료된다)
 */
export const YOUTUBE_AUTH_EXPIRED_MESSAGE =
  "유튜브 연결이 만료됐어요. 자동 가져오기는 잠시 쓸 수 없지만 아래에서 직접 입력해 등록할 수 있어요. " +
  "(관리자: 공개 재생목록은 YOUTUBE_API_KEY와 YOUTUBE_RECOMMENDED_PLAYLIST_ID만 넣으면 " +
  "재인증 없이 동작합니다. 좋아요 목록까지 쓰려면 refresh token을 다시 발급해주세요)";

export const YOUTUBE_AUTH_MISSING_MESSAGE =
  "유튜브 연결 설정이 아직 없어요. 자동 가져오기는 쓸 수 없지만 아래에서 직접 입력해 등록할 수 있어요. " +
  "(관리자: 공개 재생목록은 YOUTUBE_API_KEY, 좋아요 목록은 " +
  "YOUTUBE_CLIENT_ID·CLIENT_SECRET·REFRESH_TOKEN 환경변수가 필요합니다)";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

/**
 * 저장된 refresh token으로 YouTube Data API용 access token을 발급받는다.
 * 관리자 본인 계정의 OAuth 인증(Google Cloud OAuth Playground 등)으로 얻은
 * refresh token을 환경변수에 저장해두고 재사용하는 구조.
 */
export async function getAccessToken(): Promise<string> {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new HttpError(YOUTUBE_AUTH_MISSING_MESSAGE, 503);
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");

    // 만료·해제는 관리자가 다시 인증해야 풀리는 문제라 안내 문구를 따로 준다.
    if (text.includes("invalid_grant")) {
      throw new HttpError(YOUTUBE_AUTH_EXPIRED_MESSAGE, 503);
    }

    throw new HttpError(
      `유튜브 연결에 실패했어요. (status ${response.status}) ${text}`,
      502,
    );
  }

  const data = (await response.json()) as TokenResponse;
  return data.access_token;
}
