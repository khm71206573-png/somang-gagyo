import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { linesToArray } from "@/lib/adminFormParsing";
import { generateDevotionQuestions } from "@/lib/automation/generateDevotionQuestions";
import { HttpError } from "@/lib/automation/HttpError";

interface GenerateQuestionsBody {
  reference?: string;
  verses?: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin" || profile?.status !== "approved") {
    return NextResponse.json({ error: "관리자만 사용할 수 있어요." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as GenerateQuestionsBody | null;
  const reference = body?.reference?.trim();
  const verseLines = linesToArray(body?.verses ?? "");

  if (!reference || verseLines.length === 0) {
    return NextResponse.json(
      { error: "본문 구절과 말씀 내용을 먼저 입력해주세요." },
      { status: 400 },
    );
  }

  const verses = verseLines.map((text, index) => ({ number: index + 1, text }));

  try {
    const questions = await generateDevotionQuestions(reference, verses);
    return NextResponse.json({ questions: questions.map((q) => q.question) });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "묵상 질문 생성에 실패했어요.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
