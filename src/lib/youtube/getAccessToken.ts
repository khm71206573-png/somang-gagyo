const TOKEN_URL = "https://oauth2.googleapis.com/token";

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
    throw new Error(
      "YOUTUBE_CLIENT_ID/CLIENT_SECRET/REFRESH_TOKEN이 설정되지 않았어요.",
    );
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

    // invalid_grant = 저장해둔 refresh token이 만료됐거나 취소된 상태.
    // 구글 OAuth 동의 화면이 "테스트" 상태면 토큰이 7일 만에 만료되므로,
    // 화면에는 무엇을 해야 하는지만 알려주고 자세한 응답은 로그로 남긴다.
    if (text.includes("invalid_grant")) {
      console.error("[youtube] refresh token 만료/취소:", text);
      throw new Error(
        "유튜브 연동이 끊겼어요. 관리자에게 YOUTUBE_REFRESH_TOKEN 재발급을 요청해주세요. " +
          "그동안에는 곡 정보를 직접 입력해 등록할 수 있어요.",
      );
    }

    throw new Error(`YouTube access token 발급에 실패했어요. (status ${response.status}) ${text}`);
  }

  const data = (await response.json()) as TokenResponse;
  return data.access_token;
}
