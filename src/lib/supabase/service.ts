import { createClient } from "@supabase/supabase-js";

/**
 * RLS를 우회하는 서비스 롤 클라이언트.
 * 사용자 세션이 없는 서버 전용 작업(Cron 등)에서만 사용한다.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
