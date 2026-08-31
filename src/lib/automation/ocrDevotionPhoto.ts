import Anthropic from "@anthropic-ai/sdk";
import { HttpError } from "./HttpError";

/** Claude가 읽을 수 있는 이미지 형식. 아이폰 기본 촬영본(HEIC)은 여기에 없다. */
export const OCR_IMAGE_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export type OcrImageMediaType = (typeof OCR_IMAGE_MEDIA_TYPES)[number];

export function isOcrImageMediaType(value: string): value is OcrImageMediaType {
  return (OCR_IMAGE_MEDIA_TYPES as readonly string[]).includes(value);
}

export interface OcrPhotoInput {
  base64: string;
  mediaType: OcrImageMediaType;
}

export interface OcrVerse {
  number: number;
  text: string;
}

export interface OcrCommentarySection {
  heading: string;
  body: string;
}

export interface OcrFootnote {
  marker: string;
  text: string;
  verse: number | null;
}

export interface OcrDevotionResult {
  /** 지면에는 연도가 없다. "MM-DD"만 돌려주고 연도는 호출부에서 붙인다. */
  monthDay: string | null;
  title: string;
  reference: string;
  hymn: string | null;
  verses: OcrVerse[];
  questions: string[];
  commentary: OcrCommentarySection[];
  prayer: string | null;
  practice: string | null;
  footnotes: OcrFootnote[];
}

const OCR_TOOL_NAME = "submit_devotion_page";

const SYSTEM_PROMPT = [
  "당신은 '하나님나라QT' 책 지면 사진을 읽어 앱에 넣을 데이터로 옮기는 사람입니다.",
  "사진에 실제로 인쇄된 글자만 옮깁니다. 흐리거나 가려서 확신이 없으면 지어내지 말고 비워둡니다.",
  "",
  "지면 구조:",
  "- 상단 띠 : 월/일/요일, 성경 본문 범위, 찬송가, 그리고 그 아래 큰 제목",
  "- '하나님 나라 읽기 Lectio' : 성경 본문. 절 번호가 문장 중간에 작은 숫자로 붙어 있습니다.",
  "- 번호가 붙은 질문 3개 : 대개 왼쪽 단에 있고 끝에 (2절)처럼 절 표기가 붙습니다.",
  "- '하나님 나라 묵상하기 Meditatio' : 소제목('성경 속의 하나님 나라', '지금 이곳의 하나님 나라')마다 해설 한 문단",
  "- '하나님 나라 구하기 Oratio' : 짧은 기도문",
  "- '하나님 나라 살기 Contemplatio' : 한 줄 실천 문장",
  "- 각주 : a b c d 같은 표시와 함께 작은 글씨로 붙습니다.",
  "",
  "본문(Lectio)을 옮길 때:",
  "- 절 번호를 기준으로 끊어서 절마다 한 항목으로 만듭니다.",
  "- 본문 글자 사이에 낀 각주 표시(a b c d)는 빼고 성경 본문만 남깁니다.",
  "- 줄바꿈 때문에 잘린 낱말은 다시 이어 붙입니다. 맞춤법을 고치거나 문장을 다듬지 않습니다.",
  "- 큰따옴표·작은따옴표는 지면 그대로 둡니다.",
  "",
  "본문 구조 개요(성경 전체 얼개를 보여주는 작은 목차)는 옮기지 않습니다.",
  "사진이 여러 장이면 한 편의 이어지는 지면으로 보고 하나로 합칩니다.",
].join("\n");

const OCR_TOOL: Anthropic.Tool = {
  name: OCR_TOOL_NAME,
  description: "사진에서 읽어낸 QT 지면 내용을 제출합니다.",
  input_schema: {
    type: "object",
    properties: {
      monthDay: {
        type: "string",
        description:
          "지면 상단의 월과 일을 MM-DD로. 예: 8월 31일이면 \"08-31\". 연도는 지면에 없으므로 넣지 않는다. 못 읽으면 생략.",
      },
      title: { type: "string", description: "지면 상단의 큰 제목." },
      reference: {
        type: "string",
        description: "성경 본문 범위. 예: \"출애굽기 11:1-10\"",
      },
      hymn: {
        type: "string",
        description:
          "찬송가가 몇 장인지만. 예: \"317장 (통 353)\". 앱 화면이 \"찬송가\"를 앞에 붙여 주므로 그 낱말은 넣지 않는다. 찬송가 제목도 넣지 않는다. 없으면 생략.",
      },
      verses: {
        type: "array",
        description: "Lectio 성경 본문을 절 단위로 끊은 것.",
        items: {
          type: "object",
          properties: {
            number: { type: "integer", description: "절 번호" },
            text: { type: "string", description: "각주 표시를 뺀 절 본문" },
          },
          required: ["number", "text"],
        },
      },
      questions: {
        type: "array",
        description:
          "지면에 인쇄된 묵상 질문. 끝의 절 표기까지 그대로 포함한다. 예: \"...무엇일까요? (2절)\"",
        items: { type: "string" },
      },
      commentary: {
        type: "array",
        description: "Meditatio의 소제목별 해설.",
        items: {
          type: "object",
          properties: {
            heading: {
              type: "string",
              description: "소제목. 예: \"성경 속의 하나님 나라\"",
            },
            body: { type: "string", description: "그 소제목 아래 해설 전문" },
          },
          required: ["heading", "body"],
        },
      },
      prayer: { type: "string", description: "Oratio 기도문. 없으면 생략." },
      practice: {
        type: "string",
        description: "Contemplatio 한 줄 실천 문장. 없으면 생략.",
      },
      footnotes: {
        type: "array",
        description: "각주. 글씨가 작아 확신이 없으면 통째로 비워도 된다.",
        items: {
          type: "object",
          properties: {
            marker: { type: "string", description: "각주 표시. 예: \"a\"" },
            text: { type: "string", description: "각주 내용" },
            verse: {
              type: "integer",
              description: "각주가 가리키는 절 번호. 모르면 생략.",
            },
          },
          required: ["marker", "text"],
        },
      },
    },
    required: ["title", "reference", "verses", "questions", "commentary"],
  },
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function asVerses(value: unknown): OcrVerse[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const row = item as { number?: unknown; text?: unknown };
      const number = Number(row.number);
      const text = asString(row.text);
      return Number.isFinite(number) && text ? { number, text } : null;
    })
    .filter((verse): verse is OcrVerse => verse !== null);
}

function asCommentary(value: unknown): OcrCommentarySection[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const row = item as { heading?: unknown; body?: unknown };
      const heading = asString(row.heading);
      const body = asString(row.body);
      return body ? { heading: heading ?? "묵상", body } : null;
    })
    .filter((section): section is OcrCommentarySection => section !== null);
}

function asFootnotes(value: unknown): OcrFootnote[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const row = item as { marker?: unknown; text?: unknown; verse?: unknown };
      const marker = asString(row.marker);
      const text = asString(row.text);
      const verse = Number(row.verse);
      return marker && text
        ? { marker, text, verse: Number.isFinite(verse) ? verse : null }
        : null;
    })
    .filter((footnote): footnote is OcrFootnote => footnote !== null);
}

function asQuestions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => asString(item))
    .filter((question): question is string => question !== null);
}

/**
 * 화면이 "찬송가"를 앞에 붙여 그리므로 값에는 그 낱말이 없어야 한다.
 * 프롬프트로도 막지만, 모델이 "찬송가 317장"처럼 보내오면 "찬송가 찬송가 317장"이
 * 되어버려서 여기서 한 번 더 떼어낸다.
 */
function normalizeHymn(value: unknown): string | null {
  const text = asString(value);
  if (!text) return null;

  const stripped = text.replace(/^\s*찬송가\s*/, "").trim();
  return stripped.length > 0 ? stripped : null;
}

/** "08-31"처럼 두 자리-두 자리이고 실제로 있는 날짜인지 본다. */
function asMonthDay(value: unknown): string | null {
  const text = asString(value);
  if (!text) return null;

  const match = text.match(/^(\d{2})-(\d{2})$/);
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  return text;
}

/**
 * QT 책 지면 사진을 Claude로 읽어 구조화된 결과를 돌려준다.
 * 여러 장이면 한 편의 이어지는 지면으로 보고 한 번의 호출에 함께 넣는다.
 *
 * 결과를 그대로 저장하지 않는다. 관리자 등록 화면의 입력칸을 채워주고,
 * 사람이 사진과 대조해 고친 뒤 저장하는 것이 전제다.
 */
export async function ocrDevotionPhoto(
  photos: OcrPhotoInput[],
): Promise<OcrDevotionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new HttpError(
      "ANTHROPIC_API_KEY가 설정되지 않아 사진을 읽을 수 없어요.",
      500,
    );
  }

  if (photos.length === 0) {
    throw new HttpError("읽을 사진이 없어요.", 400);
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          ...photos.map(
            (photo): Anthropic.ImageBlockParam => ({
              type: "image",
              source: {
                type: "base64",
                media_type: photo.mediaType,
                data: photo.base64,
              },
            }),
          ),
          {
            type: "text",
            text: "이 지면의 내용을 옮겨주세요.",
          },
        ],
      },
    ],
    tools: [OCR_TOOL],
    tool_choice: { type: "tool", name: OCR_TOOL_NAME },
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );

  if (!toolUse) {
    throw new HttpError("사진을 읽은 결과를 이해하지 못했어요.", 502);
  }

  const input = toolUse.input as Record<string, unknown>;

  const title = asString(input.title);
  const reference = asString(input.reference);
  const verses = asVerses(input.verses);

  if (!title || !reference || verses.length === 0) {
    const missing = [
      !title && "제목",
      !reference && "본문 구절",
      verses.length === 0 && "성경 본문",
    ]
      .filter(Boolean)
      .join(", ");

    throw new HttpError(
      `사진에서 ${missing}을(를) 찾지 못했어요. 지면 전체가 나오게 다시 찍어주세요.`,
      422,
    );
  }

  return {
    monthDay: asMonthDay(input.monthDay),
    title,
    reference,
    hymn: normalizeHymn(input.hymn),
    verses,
    questions: asQuestions(input.questions),
    commentary: asCommentary(input.commentary),
    prayer: asString(input.prayer),
    practice: asString(input.practice),
    footnotes: asFootnotes(input.footnotes),
  };
}
