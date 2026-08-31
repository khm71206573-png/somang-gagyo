import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { storageObjectPath } from "@/lib/storage/fileName";
import { HttpError } from "@/lib/automation/HttpError";
import {
  isOcrImageMediaType,
  ocrDevotionPhoto,
  type OcrPhotoInput,
} from "@/lib/automation/ocrDevotionPhoto";
import { resolveDevotionDate } from "@/lib/devotionDate";
import { commentaryToText, footnotesToText } from "@/lib/devotionQtParsing";
import { toDateString } from "@/lib/supabase/queries/utils";

const BUCKET = "devotion-photos";

/** 한 편이 두 페이지라 보통 2장, 넉넉히 4장까지 받는다. */
const MAX_PHOTOS = 4;

/** 등록 화면에서 긴 변 1600px JPEG로 줄여 보내므로 한 장이 이만큼 넘을 일은 없다. */
const MAX_PHOTO_BYTES = 6 * 1024 * 1024;

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      supabase,
      errorResponse: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin" || profile?.status !== "approved") {
    return {
      supabase,
      errorResponse: NextResponse.json({ error: "관리자만 사용할 수 있어요." }, { status: 403 }),
    };
  }

  return { supabase, errorResponse: null };
}

/**
 * 하나님나라QT 책 지면 사진을 읽어 등록 화면의 입력칸을 채울 값으로 돌려준다.
 * 여기서 devotions에 저장하지는 않는다. 사람이 사진과 대조해 고친 뒤
 * 기존 POST /api/admin/devotions로 저장하는 흐름이다.
 */
export async function POST(request: Request) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const formData = await request.formData().catch(() => null);
  const files = formData?.getAll("photos").filter((entry): entry is File => entry instanceof File) ?? [];
  const todayInput = formData?.get("today");

  if (files.length === 0) {
    return NextResponse.json({ error: "사진을 한 장 이상 올려주세요." }, { status: 400 });
  }

  if (files.length > MAX_PHOTOS) {
    return NextResponse.json(
      { error: `사진은 ${MAX_PHOTOS}장까지 올릴 수 있어요.` },
      { status: 400 },
    );
  }

  for (const file of files) {
    if (!isOcrImageMediaType(file.type)) {
      return NextResponse.json(
        { error: "JPG·PNG 사진만 읽을 수 있어요. 다시 촬영해주세요." },
        { status: 400 },
      );
    }

    if (file.size > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { error: "사진 용량이 너무 커요. 다시 촬영해주세요." },
        { status: 400 },
      );
    }
  }

  // 사진을 먼저 읽어 두면 업로드와 OCR에 같은 바이트를 쓸 수 있다.
  const photos: (OcrPhotoInput & { file: File; buffer: Buffer })[] = [];

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    photos.push({
      file,
      buffer,
      base64: buffer.toString("base64"),
      // 위 반복문에서 이미 확인한 형식이다.
      mediaType: file.type as OcrPhotoInput["mediaType"],
    });
  }

  let result;
  try {
    result = await ocrDevotionPhoto(
      photos.map(({ base64, mediaType }) => ({ base64, mediaType })),
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "사진을 읽지 못했어요.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // 글자를 잘못 읽었을 때 대조할 수 있게 원본을 남긴다.
  // OCR이 성공한 사진만 올려서, 실패한 시도가 스토리지에 쌓이지 않게 한다.
  const imageUrls: string[] = [];

  for (const photo of photos) {
    const path = storageObjectPath("kingdom-qt", photo.file);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, photo.buffer, { contentType: photo.file.type });

    // 사진 보관은 덤이라, 업로드가 막혀도 읽어낸 본문은 그대로 돌려준다.
    if (uploadError) continue;

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);
    imageUrls.push(publicUrl);
  }

  const today =
    typeof todayInput === "string" && /^\d{4}-\d{2}-\d{2}$/.test(todayInput)
      ? todayInput
      : toDateString(new Date());

  const { devotionDate, warning } = resolveDevotionDate(result.monthDay, today);

  return NextResponse.json({
    devotionDate,
    warning,
    title: result.title,
    reference: result.reference,
    hymn: result.hymn ?? "",
    verses: result.verses.map((verse) => verse.text),
    questions: result.questions,
    commentary: commentaryToText(result.commentary),
    prayer: result.prayer ?? "",
    practice: result.practice ?? "",
    footnotes: footnotesToText(result.footnotes),
    imageUrls,
  });
}
