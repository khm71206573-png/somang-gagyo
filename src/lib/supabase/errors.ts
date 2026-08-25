/** 42703 = 컬럼 없음(SQL), PGRST204 = 컬럼 없음(PostgREST 스키마 캐시) */
const MISSING_COLUMN_CODES = ["42703", "PGRST204"];

/** 42P01 = 테이블/뷰 없음 */
const MISSING_TABLE_CODE = "42P01";

/**
 * 마이그레이션이 아직 적용되지 않은 DB인지 구분한다.
 * 새 컬럼을 쓰는 코드가 배포된 직후에도 화면이 멈추지 않도록,
 * 이 판정으로 "그 컬럼만 빼고" 다시 시도하는 데 쓴다.
 */
export function isMissingColumnError(error: { code?: string } | null | undefined) {
  return MISSING_COLUMN_CODES.includes(error?.code ?? "");
}

export function isMissingTableError(error: { code?: string } | null | undefined) {
  return error?.code === MISSING_TABLE_CODE;
}
