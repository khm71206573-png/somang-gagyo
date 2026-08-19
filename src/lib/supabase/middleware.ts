import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/auth/callback",
  "/auth/auth-code-error",
  "/offline",
];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!user) {
    if (isPublicPath) return response;
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("status, role, name, gyogyo")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      `[middleware] profiles 조회 실패 (user=${user.id}, path=${pathname}):`,
      profileError.message,
    );
  }

  // profiles 행이 아직 없는 극히 드문 경우(가입 트리거 지연 등)도 pending으로 취급
  const status = profile?.status ?? "pending";

  // profiles.status에는 별도의 "온보딩 전" 값이 없으므로, 실명/소속 가교가
  // 아직 채워지지 않은 상태를 "온보딩 필요"로 취급한다. 이미 승인되었거나
  // 거절된 계정은 (관리자가 임의로 값 없이 처리했더라도) 다시 온보딩으로
  // 되돌리지 않는다.
  const needsOnboarding = status === "pending" && (!profile?.name || !profile?.gyogyo);

  if (needsOnboarding) {
    if (pathname === "/onboarding") return response;
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  if (status !== "approved") {
    // pending(온보딩 완료)/rejected는 /pending 페이지가 상태에 따라 다른 문구를 보여준다
    if (pathname === "/pending") return response;
    return NextResponse.redirect(new URL("/pending", request.url));
  }

  if (pathname.startsWith("/admin") && profile?.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (
    pathname === "/login" ||
    pathname === "/pending" ||
    pathname === "/onboarding"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
