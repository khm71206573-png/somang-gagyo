import Anthropic from "@anthropic-ai/sdk";

interface Verse {
  number: number;
  text: string;
}

export interface GeneratedQuestion {
  id: number;
  question: string;
}

const QUESTION_TOOL_NAME = "submit_devotion_questions";

/**
 * 본문(reference/verses)에 맞는 묵상 질문 3개를 Claude로 생성한다.
 * ANTHROPIC_API_KEY가 없거나 호출이 실패하면 호출부에서 잡아 빈 배열로 대체해야 한다
 * (묵상 등록/스크랩 자체는 질문 생성 실패로 막히면 안 됨).
 */
export async function generateDevotionQuestions(
  reference: string,
  verses: Verse[],
): Promise<GeneratedQuestion[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY가 설정되지 않았어요.");
  }

  const client = new Anthropic({ apiKey });
  const passageText = verses.map((v) => `${v.number}. ${v.text}`).join("\n");

  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 4096,
    output_config: { effort: "low" },
    system:
      "당신은 교회 성도들을 위한 묵상 질문을 만드는 도우미입니다. 주어진 본문을 깊이 묵상할 수 있도록 서로 다른 각도(본문 이해, 삶에의 적용, 기도/결단)에서 한국어 질문 3개를 만듭니다. 질문은 짧고 구체적이며, 오늘 본문의 표현이나 내용을 직접 반영해야 합니다.",
    messages: [
      {
        role: "user",
        content: `본문: ${reference}\n\n${passageText}\n\n이 본문에 맞는 묵상 질문 3개를 만들어주세요.`,
      },
    ],
    tools: [
      {
        name: QUESTION_TOOL_NAME,
        description: "생성한 묵상 질문 3개를 제출합니다.",
        input_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: { type: "string" },
              minItems: 3,
              maxItems: 3,
              description: "본문에 맞는 묵상 질문 3개",
            },
          },
          required: ["questions"],
        },
      },
    ],
    tool_choice: { type: "tool", name: QUESTION_TOOL_NAME },
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
  );

  if (!toolUse) {
    throw new Error("묵상 질문 생성 응답을 이해하지 못했어요.");
  }

  const input = toolUse.input as { questions?: unknown };
  const questions = Array.isArray(input.questions) ? input.questions : [];

  return questions
    .filter((q): q is string => typeof q === "string" && q.trim().length > 0)
    .slice(0, 3)
    .map((question, index) => ({ id: index + 1, question: question.trim() }));
}
