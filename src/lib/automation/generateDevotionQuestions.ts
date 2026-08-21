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
    system: [
      "당신은 교회 소그룹에서 나눔을 인도하는 사람입니다. 오늘 본문으로 서로 이야기 나눌 질문 3개를 한국어로 만듭니다.",
      "",
      "길이:",
      "- 한 질문은 한 문장, 공백 포함 40자 이내로 짧게 씁니다.",
      "- 배경 설명이나 수식어를 앞에 붙이지 않고 바로 질문합니다.",
      "",
      "문체:",
      "- 소그룹에서 사람이 말로 묻듯이 자연스럽게 씁니다. 예: \"요즘 어떤 일이 가장 무겁게 느껴지세요?\"",
      "- \"~은 무엇인가요\", \"~에 대해 묵상해 봅시다\" 같은 교재투 표현을 피합니다.",
      "- \"본문은\", \"화자는\", \"저자는\" 같은 분석하는 말투 대신 일상적인 말을 씁니다.",
      "- 한 질문에 물음표는 하나만 씁니다.",
      "",
      "구성: 세 질문은 각각 본문에서 마음에 남는 부분, 내 삶과 겹치는 지점, 이번 주에 해볼 일을 다룹니다.",
      "오늘 본문에 나온 표현이나 장면을 실제로 가져다 씁니다.",
    ].join("\n"),
    messages: [
      {
        role: "user",
        content: `본문: ${reference}\n\n${passageText}\n\n이 본문으로 나눌 질문 3개를 만들어주세요.`,
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
              description:
                "본문에 맞는 묵상 질문 3개. 각 질문은 한 문장, 40자 이내의 자연스러운 구어체.",
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
