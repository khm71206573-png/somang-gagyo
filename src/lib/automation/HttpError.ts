/**
 * 자동화 함수(scrapeDevotion/scrapeSermon/syncSong)가 던지는, 의도한 HTTP 상태 코드를
 * 실어 나르는 에러. Cron 라우트와 관리자 라우트 양쪽에서 동일하게 status로 매핑한다.
 */
export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}
