/**
 * Supabase 스토리지 키에는 ASCII 문자만 쓸 수 있다.
 * 한글이 섞인 파일명을 그대로 경로에 넣으면 업로드가
 * "Invalid key: <경로>" 오류로 실패하기 때문에,
 * 업로드 경로에 쓸 이름은 안전한 문자로만 남긴다.
 */

/** 확장자가 없는 파일(모바일 카메라 등)에 붙여줄 확장자 */
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/avif": "avif",
  "application/pdf": "pdf",
};

/** 영문·숫자만 남기고 나머지는 "-"로 바꾼다. (한글은 통째로 사라진다) */
function asciiSegment(value: string) {
  return value
    .normalize("NFKD")
    // 분해된 발음기호를 떼어내면 é → e 처럼 알파벳이 살아남는다.
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** "참_아름다와라_D_.jpg" → "file.jpg" 처럼 스토리지가 받아주는 이름으로 바꾼다. */
export function storageSafeFileName(fileName: string, contentType?: string) {
  const dotIndex = fileName.lastIndexOf(".");
  const rawBase = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
  const rawExtension = dotIndex > 0 ? fileName.slice(dotIndex + 1) : "";

  const base = asciiSegment(rawBase) || "file";
  const extension =
    asciiSegment(rawExtension).toLowerCase() ||
    EXTENSION_BY_TYPE[(contentType ?? "").toLowerCase()] ||
    "";

  return extension ? `${base}.${extension}` : base;
}

/**
 * 업로드 경로를 만든다.
 * 한글 파일명은 이름이 전부 지워져 서로 겹칠 수 있어서 무작위 조각을 함께 붙인다.
 */
export function storageObjectPath(folder: string, file: { name: string; type: string }) {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${folder}/${Date.now()}-${suffix}-${storageSafeFileName(file.name, file.type)}`;
}
