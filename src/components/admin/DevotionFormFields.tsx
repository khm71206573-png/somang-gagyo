"use client";

import {
  fieldGroup,
  fieldInput,
  fieldLabel,
  fieldTextarea,
} from "@/components/admin/adminFormStyles";

/** 등록·수정 화면이 함께 쓰는 묵상 입력값. 전부 입력칸의 문자열 그대로다. */
export interface DevotionFormValues {
  devotionDate: string;
  tag: string;
  title: string;
  reference: string;
  verses: string;
  questions: string;
  hymn: string;
  commentary: string;
  prayer: string;
  practice: string;
  footnotes: string;
}

export function emptyDevotionFormValues(devotionDate: string): DevotionFormValues {
  return {
    devotionDate,
    tag: "",
    title: "",
    reference: "",
    verses: "",
    questions: "",
    hymn: "",
    commentary: "",
    prayer: "",
    practice: "",
    footnotes: "",
  };
}

interface DevotionFormFieldsProps {
  values: DevotionFormValues;
  onChange: (patch: Partial<DevotionFormValues>) => void;
  onGenerateQuestions: () => void;
  isGeneratingQuestions: boolean;
}

export function DevotionFormFields({
  values,
  onChange,
  onGenerateQuestions,
  isGeneratingQuestions,
}: DevotionFormFieldsProps) {
  return (
    <>
      <div className={fieldGroup}>
        <label htmlFor="devotionDate" className={fieldLabel}>
          날짜 <span className="text-destructive">*</span>
        </label>
        <input
          id="devotionDate"
          type="date"
          value={values.devotionDate}
          onChange={(event) => onChange({ devotionDate: event.target.value })}
          className={fieldInput}
        />
      </div>

      <div className={fieldGroup}>
        <label htmlFor="tag" className={fieldLabel}>
          태그 <span className="text-muted-foreground">(선택)</span>
        </label>
        <input
          id="tag"
          value={values.tag}
          onChange={(event) => onChange({ tag: event.target.value })}
          placeholder="예: 오늘의 묵상"
          className={fieldInput}
        />
      </div>

      <div className={fieldGroup}>
        <label htmlFor="title" className={fieldLabel}>
          제목 <span className="text-destructive">*</span>
        </label>
        <input
          id="title"
          value={values.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="묵상 제목"
          className={fieldInput}
        />
      </div>

      <div className={fieldGroup}>
        <label htmlFor="reference" className={fieldLabel}>
          본문 구절 <span className="text-destructive">*</span>
        </label>
        <input
          id="reference"
          value={values.reference}
          onChange={(event) => onChange({ reference: event.target.value })}
          placeholder="예: 출애굽기 11:1-10"
          className={fieldInput}
        />
      </div>

      <div className={fieldGroup}>
        <label htmlFor="hymn" className={fieldLabel}>
          찬송가 <span className="text-muted-foreground">(선택, 몇 장인지만)</span>
        </label>
        <input
          id="hymn"
          value={values.hymn}
          onChange={(event) => onChange({ hymn: event.target.value })}
          placeholder="예: 317장 (통 353)"
          className={fieldInput}
        />
      </div>

      <div className={fieldGroup}>
        <label htmlFor="verses" className={fieldLabel}>
          말씀 내용 <span className="text-destructive">*</span>
          <span className="ml-1 text-muted-foreground">(한 줄에 한 절씩)</span>
        </label>
        <textarea
          id="verses"
          rows={8}
          value={values.verses}
          onChange={(event) => onChange({ verses: event.target.value })}
          placeholder={"1 주님께서 모세에게 말씀하셨다...\n2 이제 너는 백성에게 일러서..."}
          className={fieldTextarea}
        />
        <p className="text-label-sm text-muted-foreground">
          줄 앞의 숫자를 절 번호로 씁니다. 모든 줄에 번호가 없으면 위에서부터 1절로 셉니다.
        </p>
      </div>

      <div className={fieldGroup}>
        <label htmlFor="commentary" className={fieldLabel}>
          묵상 해설 <span className="text-muted-foreground">(선택)</span>
        </label>
        <textarea
          id="commentary"
          rows={10}
          value={values.commentary}
          onChange={(event) => onChange({ commentary: event.target.value })}
          placeholder={
            "성경 속의 하나님 나라\n이제 마지막 한 가지 재앙만 남았습니다...\n\n지금 이곳의 하나님 나라\n신앙인도 세상과 같은 무대에서..."
          }
          className={fieldTextarea}
        />
        <p className="text-label-sm text-muted-foreground">
          빈 줄로 나눈 덩어리마다 첫 줄이 소제목, 나머지가 본문이에요.
        </p>
      </div>

      <div className={fieldGroup}>
        <div className="flex items-center justify-between">
          <label htmlFor="questions" className={fieldLabel}>
            묵상 질문 <span className="text-muted-foreground">(선택, 한 줄에 하나씩)</span>
          </label>
          <button
            type="button"
            onClick={onGenerateQuestions}
            disabled={isGeneratingQuestions}
            className="text-label-sm font-medium text-primary disabled:opacity-50"
          >
            {isGeneratingQuestions ? "생성 중..." : "AI로 질문 만들기"}
          </button>
        </div>
        <textarea
          id="questions"
          rows={4}
          value={values.questions}
          onChange={(event) => onChange({ questions: event.target.value })}
          placeholder={
            "이스라엘 백성들이 나가게 될 때 금과 은을 요구하라고 하신 이유는 무엇일까요? (2절)"
          }
          className={fieldTextarea}
        />
        <p className="text-label-sm text-muted-foreground">
          책에 실린 질문을 그대로 씁니다. 사진에서 질문을 읽지 못했을 때만 AI로 만들어주세요.
          비워두면 기본 묵상 질문으로 올라가요.
        </p>
      </div>

      <div className={fieldGroup}>
        <label htmlFor="prayer" className={fieldLabel}>
          기도 <span className="text-muted-foreground">(선택)</span>
        </label>
        <textarea
          id="prayer"
          rows={3}
          value={values.prayer}
          onChange={(event) => onChange({ prayer: event.target.value })}
          placeholder="백성을 영화롭게 하시는 주님, ..."
          className={fieldTextarea}
        />
      </div>

      <div className={fieldGroup}>
        <label htmlFor="practice" className={fieldLabel}>
          오늘 살기 <span className="text-muted-foreground">(선택, 한 줄)</span>
        </label>
        <textarea
          id="practice"
          rows={2}
          value={values.practice}
          onChange={(event) => onChange({ practice: event.target.value })}
          placeholder="우리가 하나님을 영화롭게 하기 전에, ..."
          className={fieldTextarea}
        />
      </div>

      <div className={fieldGroup}>
        <label htmlFor="footnotes" className={fieldLabel}>
          각주 <span className="text-muted-foreground">(선택, 한 줄에 하나씩)</span>
        </label>
        <textarea
          id="footnotes"
          rows={4}
          value={values.footnotes}
          onChange={(event) => onChange({ footnotes: event.target.value })}
          placeholder={"a) 오랜 종살이의 정당한 품삯과 같다. (2절)"}
          className={fieldTextarea}
        />
        <p className="text-label-sm text-muted-foreground">
          끝의 (N절)을 보고 그 절 옆에 작은 표시로 붙어요. 지면에서 글씨가 가장 작은
          부분이라 잘못 읽히기 쉬우니, 필요 없으면 비워두세요.
        </p>
      </div>
    </>
  );
}
