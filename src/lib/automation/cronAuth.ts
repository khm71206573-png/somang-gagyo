import { NextResponse } from "next/server";

/**
 * 크론 요청 인증. 실패 시 어디가 문제인지 구분해서 알려준다.
 *
 * 예전에는 어떤 경우든 "Unauthorized"만 돌려줘서, 서버에 CRON_SECRET이
 * 아예 없는 것인지 호출 쪽 값과 다른 것인지 구분할 수 없었다.
 * 비밀값 자체는 절대 응답에 담지 않고, 어느 쪽을 고쳐야 하는지만 알려준다.
 */
export function checkCronAuth(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        reason: "server_secret_missing",
        hint: "서버(Vercel)에 CRON_SECRET 환경변수가 설정되어 있지 않습니다.",
      },
      { status: 401 },
    );
  }

  const header = request.headers.get("authorization");

  if (!header) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        reason: "missing_authorization_header",
        hint: "요청에 Authorization 헤더가 없습니다.",
      },
      { status: 401 },
    );
  }

  if (header !== `Bearer ${secret}`) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        reason: "secret_mismatch",
        hint: "호출 쪽 CRON_SECRET 값이 서버에 설정된 값과 다릅니다.",
      },
      { status: 401 },
    );
  }

  return null;
}
