# 온기 (On-gi) — 소망가교 어플 디자인 시스템

> Stitch 프로젝트 `소망가교 어플` (projects/8205390006825896696)에서 추출
> 최종 업데이트: 2026-08-16

한국 교회 커뮤니티를 위한 신앙 습관 형성 앱. **따뜻함(Warmth)**, **평온함(Calm)**,
**현대적인 미니멀리즘(Modern Minimalism)**을 핵심 가치로 하는 **Soft Minimalism** 스타일.
넓은 여백과 따뜻한 색감으로 시각적 노이즈를 최소화하고, 사용자가 묵상·기도에 집중할 수 있게 돕는다.

---

## 1. 색상 팔레트 (Colors)

### 브랜드 포인트 컬러
| 용도 | 색상 | HEX |
|---|---|---|
| Primary (Point) | Soft Terracotta | `#C8724A` |
| Secondary (Success) | Sage Green | `#7A9471` |
| Neutral (본문 텍스트) | Charcoal | `#2C2C2C` |
| Tertiary (보조 텍스트) | Warm Gray | `#8A8580` |

- **Point Color (Terracotta #C8724A)**: 성경 읽기·기도 시작 등 핵심 행동(CTA)에 사용. 흙과 같은 따뜻한 생명력 상징.
- **Success (Sage Green #7A9471)**: 습관 완료·평온한 상태 표시. 숲과 같은 안정감.
- **Background (#FBF9F6)**: 차가운 흰색 대신 따뜻한 아이보리 톤으로 눈의 피로 경감.
- **Surface (#FFFFFF)**: 카드 등 정보 컨테이너는 순백색으로 배경과 미세하게 분리.
- **텍스트 위계**: 주 텍스트 `#2C2C2C`(깊이감), 보조 텍스트 `#8A8580`(계층 구분).

### 전체 토큰 (Material 3 기반)
| 토큰 | HEX |
|---|---|
| surface | `#fcf9f8` |
| surface-dim | `#dcd9d9` |
| surface-bright | `#fcf9f8` |
| surface-container-lowest | `#ffffff` |
| surface-container-low | `#f6f3f2` |
| surface-container | `#f0eded` |
| surface-container-high | `#eae7e7` |
| surface-container-highest | `#e4e2e1` |
| on-surface | `#1b1c1c` |
| on-surface-variant | `#54433c` |
| inverse-surface | `#303030` |
| inverse-on-surface | `#f3f0f0` |
| outline | `#87736b` |
| outline-variant | `#dac1b8` |
| surface-tint | `#944925` |
| primary | `#914723` |
| on-primary | `#ffffff` |
| primary-container | `#b05f38` |
| on-primary-container | `#fffbff` |
| inverse-primary | `#ffb596` |
| secondary | `#4c6545` |
| on-secondary | `#ffffff` |
| secondary-container | `#ceebc3` |
| on-secondary-container | `#526b4b` |
| tertiary | `#5f5b57` |
| on-tertiary | `#ffffff` |
| tertiary-container | `#78746f` |
| on-tertiary-container | `#fffbff` |
| error | `#ba1a1a` |
| on-error | `#ffffff` |
| error-container | `#ffdad6` |
| on-error-container | `#93000a` |
| background | `#fcf9f8` |
| on-background | `#1b1c1c` |

---

## 2. 타이포그래피 (Typography)

- **본문/UI 서체**: Be Vietnam Pro (한글 구현 시 **Pretendard** 스타일 기준)
- **숫자/헤드라인**: Plus Jakarta Sans 혼용 (세련미 강조)
- 한글 가독성 최우선, 자간 미세하게 좁힘 (`-1% ~ -2%`)로 시각적 단단함 부여
- 본문 행간 1.5배 이상 유지 (장문 묵상 글 최적화)

| 스타일 | 폰트 | 크기 | 굵기 | 행간 | 자간 |
|---|---|---|---|---|---|
| display-lg | Plus Jakarta Sans | 32px | 700 | 44px | -0.02em |
| headline-md | Plus Jakarta Sans | 24px | 700 | 32px | -0.01em |
| title-lg | Be Vietnam Pro | 20px | 600 | 28px | - |
| body-lg | Be Vietnam Pro | 17px | 400 | 26px | - |
| body-md | Be Vietnam Pro | 15px | 400 | 22px | - |
| label-sm | Be Vietnam Pro | 13px | 500 | 18px | 0.02em |

**용도 가이드**
- Headlines: 굵고 신뢰감 있는 서체로 매일의 메시지·제목 전달
- Body: 장문 묵상 글에 최적화된 넓은 행간
- Labels: 기능적 텍스트는 간결하고 정돈된 느낌

---

## 3. 간격 규칙 (Spacing & Layout)

모바일 기기(**390×844**) 기준 고정 그리드 시스템.

| 토큰 | 값 | 용도 |
|---|---|---|
| margin-main | 20px | 화면 좌우 안전 마진 |
| gutter-card | 12px | 카드 간 간격 |
| stack-lg | 32px | 섹션 간 수직 리듬 (말씀/기도 등 활동 구분) |
| stack-md | 16px | 중간 요소 간 간격 |
| stack-sm | 8px | 밀접 요소 간 간격 |

- **카드 내부 패딩**: 기본 20px (가독 영역 확보)
- **Bottom Navigation**: 높이 84px 권장, 5개 탭 균등 배치

### 라운드값 (Rounded Corners)
| 토큰 | 값 |
|---|---|
| sm | 0.25rem |
| DEFAULT | 0.5rem |
| md | 0.75rem |
| lg (카드 기본) | 1rem (16px) |
| xl | 1.5rem |
| full (버튼 알약형) | 9999px |

---

## 4. 깊이감 (Elevation & Depth)

물리적 깊이감보다 **Tonal Layering** 선호.

- **Shadows**: 카드 하단에 아주 미세한 블러만 적용 — `Blur 10px, Opacity 4%, Color #2C2C2C`. 강한 그림자 지양.
- **Strokes**: 경계선이 필요하면 그림자 대신 배경보다 살짝 어두운 1px 실선(Hairline) 사용.
- **Interactions**: 버튼 클릭 시 깊이 변화 대신 채도 미세 변화 또는 스케일 축소로 촉각적 피드백.

---

## 5. 형태 (Shapes)

- **Cards**: 16px 라운드로 시각적 긴장 완화
- **Buttons**: 12px 라운드 또는 완전 알약형(Pill-shape)
- **Icons**: 2px 두께 라인 아이콘, Stroke Caps는 둥글게 (Round Cap) — 전체 톤과 일치

---

## 6. 컴포넌트 스타일 (Components)

### Buttons
- **Primary**: 테라코타(`#C8724A`) 배경 + 흰색 텍스트
- **Secondary**: 아이보리 배경 + 얇은 테두리

### Habit Cards (습관 카드)
- 오늘 완료해야 할 습관 리스트를 카드 형태로 표시
- 완료 시 체크박스는 세이지 그린(`#7A9471`)으로 부드럽게 채워짐

### Input Fields
- 배경색보다 살짝 어두운 톤의 면(Surface) 처리
- 활성화(focus) 시 테라코타 색상의 얇은 보더 표시

### Bottom Tab Bar
- 5개 메뉴: 홈 / 묵상 / 기도 / 교제 / 더보기
- 선택된 탭: 테라코타 색상
- 비활성 탭: 보조 텍스트 색상(`#8A8580`)

### Progress Bar
- 얇고 부드러운 막대 그래프
- 진행률 표시는 세이지 그린 사용 (긍정적 성취감 전달)

---

## 참고
- 원본 Stitch 프로젝트: `projects/8205390006825896696` ("소망가교 어플")
- 이 문서는 Stitch MCP의 디자인 시스템 데이터를 기반으로 자동 추출되었습니다.
- 디자인 시스템이 Stitch에서 업데이트되면 이 문서도 함께 갱신이 필요합니다.
