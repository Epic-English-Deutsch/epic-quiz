# EPIC QUIZ · 2026년 10월 고2 영어 변형문제

2026학년도 10월 고2 전국연합학력평가(2026.10.20 시행, 경기도교육청 주관) 영어 영역 **29~42번** 지문으로 만든
어법·독해 변형문제 웹 앱입니다. 빌드 도구 없이 정적 파일만으로 동작하므로 GitHub Pages에서 바로 실행됩니다.

- 지문 출처: EBSi 공식 문제지·정답 및 해설 (2026학년도 10월 고2 전국연합학력평가 영어 영역)
- 문항: 3개 유형 · 지문 13편(41·42번은 공통 지문) 기준

## 2026학년도 수능 영어 (홀수형) 29~42번 · `csat-2026/`

같은 앱 구조로 만든 별도 사이트입니다. 루트 주소는 그대로 10모 사이트이고, 수능판은 아래 주소로 열립니다.

- 미리보기: https://raw.githack.com/Epic-English-Deutsch/epic-quiz/main/csat-2026/index.html
- GitHub Pages: https://epic-english-deutsch.github.io/epic-quiz/csat-2026/ (Settings → Pages 활성화 후)
- 지문 출처: 2026학년도 대학수학능력시험 영어 영역 홀수형 문제지(한국교육과정평가원)
- 문항: 어법 양자택일 14세트·84빈칸 / 객관식 변형 14문항 / 빈칸 객관식 14문항
- 기록 키: `epic_quiz_csat2026_*` (10모 기록과 분리), Supabase 행은 category `2026수능(홀수형) · <유형>` + answers `_exam` 태그

## 2026년 9월 고3 모의고사 영어 29~42번 · `g3-2026-09/`

같은 앱 구조로 만든 세 번째 사이트입니다. 루트·수능판은 그대로이고, 9모판은 아래 주소로 열립니다.

- 미리보기: https://raw.githack.com/Epic-English-Deutsch/epic-quiz/main/g3-2026-09/index.html
- GitHub Pages: https://epic-english-deutsch.github.io/epic-quiz/g3-2026-09/ (Settings → Pages 활성화 후)
- 지문 출처: 2026년 9월 고3 모의고사(2027학년도 9월 모의평가) 영어 영역 문제지(한국교육과정평가원)
- 문항: 어법 양자택일 14세트·84빈칸 / 객관식 변형 14문항 / 빈칸 객관식 14문항
- 기록 키: `epic_quiz_g3_202609_*` (10모·수능판 기록과 분리), Supabase 행은 category `2026 9모 고3 · <유형>` + answers `_exam` 태그 `2026_g3_09`

## 구성

| 유형 | 내용 | 문항 수 |
| --- | --- | --- |
| 빈칸 양자택일 (어법) | 지문 속 어법 포인트를 `[A / B]` 두 선택지로 만들고 알맞은 형태 선택 | 13세트 · 78빈칸 |
| 객관식 변형 | 주제·제목·요지·내용일치·어휘 5지선다 | 14문항 (29~42) |
| 빈칸 객관식 | 핵심 문장을 빈칸으로 만들고 5지선다 | 14문항 (29~42) |

## 학생 사용법

1. 이름을 입력하고 유형을 고른 뒤 **문제 풀기 시작**.
2. 지문을 읽으며 빈칸/보기를 선택 → **채점하기**.
3. 결과 화면에서 정답률, 문항별 해설, **틀린 문제만 다시 풀기**를 이용합니다.

## PDF · 인쇄

상단 **PDF·인쇄** 버튼 → 범위(전체/유형) 선택 →
**학생용 문제지(정답 숨김)** 또는 **해설지 포함(정답·해설)**.
브라우저 인쇄 창에서 ‘PDF로 저장’을 고르면 PDF 파일이 만들어집니다.

## 관리자 대시보드

상단 **관리자** → 비밀번호 입력.

- 학생별 기록: 이름 · 응시 시각 · 유형 · 점수 · **정답률(%)** · 오답 문항의 ‘내 답 vs 정답’
- **문항별 정답률**: 어떤 문항을 많이 틀렸는지 낮은 순/높은 순/번호 순으로 확인
- CSV 내려받기, 기록 삭제, Supabase 동기화 설정

> 비밀번호는 정적 사이트의 화면 잠금일 뿐, 소스를 보면 확인할 수 있습니다.
> 성적 데이터는 기본적으로 **응시한 기기의 localStorage**에 저장됩니다.

## 학생 명단 · 허용/차단 (세 사이트 공통)

관리자 → **학생 명단** 탭에서 학생의 **이름 + 코드**를 등록합니다. 등록된 학생만 문제를 시작할 수 있고,
세 사이트(10모 · 수능 · 9모)가 Supabase `public.allowed_students` 표 하나를 함께 씁니다.

- 학생 화면: **학생 이름**과 **학생 코드**를 넣고 유형을 고른 뒤 시작. 명단에 없거나 차단된 학생은
  “허용되지 않았거나 차단된 학생입니다. 원장님께 이름과 코드를 확인해 주세요.”라는 안내와 함께 막힙니다.
- 저장된 답안(새로고침 복원)도 같은 확인을 거칩니다. 차단된 학생은 복원되지 않습니다.
- `차단`은 삭제 대신 `active = false`로 두는 방식이라, 나중에 `허용`을 누르면 바로 되돌릴 수 있습니다.
- 관리자 버튼(0609)은 학생 확인 없이 항상 열립니다.
- 명단 표를 아직 만들지 않았거나 통신이 안 되면 학생을 막지 않고 그대로 진행합니다(사이트가 잠기지 않도록).

처음 한 번 Supabase SQL Editor에서 아래 SQL을 실행하세요.

```sql
create table if not exists public.allowed_students (
  id bigint generated always as identity primary key,
  name text not null,
  code text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index if not exists allowed_students_name_code_uidx
  on public.allowed_students (lower(btrim(name)), btrim(code));
grant usage on schema public to anon;
grant select, insert, update, delete on public.allowed_students to anon;
grant usage, select on all sequences in schema public to anon;
alter table public.allowed_students disable row level security;
```

## Supabase 동기화 (선택)

관리자 → 설정에서 URL·anon key를 넣으면 제출할 때마다 `quiz_results` 테이블로 전송되어
여러 기기에서 같은 기록을 볼 수 있습니다.

- 기본 URL: `https://vxvhushnspkxalabzzjv.supabase.co`
- 테이블: `quiz_results` (`student_name`, `category`, `score`, `total`, `accuracy`, `wrong_items` jsonb, `answers` jsonb)
- anon key가 비어 있으면 localStorage만 사용합니다.
- 읽기/쓰기 정책 예시:

```sql
alter table quiz_results enable row level security;
create policy "quiz insert" on quiz_results for insert to anon with check (true);
create policy "quiz select" on quiz_results for select to anon using (true);
```

## 파일 구조

```
index.html          화면 뼈대
styles.css          디자인 · 모바일 · 인쇄(@media print) 스타일
app.js              화면 전환, 채점, 기록 저장, 관리자, 인쇄
data/core.js        시험 정보와 유형 정의
data/grammar-a.js   29~35번 어법 양자택일
data/grammar-b.js   36~42번 어법 양자택일
data/multiple-a.js  29~35번 객관식 변형
data/multiple-b.js  36~42번 객관식 변형
data/cloze.js       29~42번 빈칸 객관식
csat-2026/          같은 구조의 2026 수능 영어 (홀수형) 29~42번 사이트
g3-2026-09/         같은 구조의 2026년 9월 고3 모의고사 영어 29~42번 사이트
```

## 문항 수정 방법

`data/*.js`의 항목을 직접 고치면 됩니다.

- 어법: `paragraphs` 안의 `{{1}}` 위치에 `blanks`의 1번 선택지가 들어갑니다. `answer`는 정답 인덱스(0부터).
- 빈칸 객관식: `{{B}}`가 빈칸 자리, `options`와 `answer`로 채점합니다.
- 객관식: `options` 5개, `answer` 인덱스.
- 보기 순서는 문항 id를 기준으로 자동 섞이므로, `options` 배열 순서를 바꿔도 정답 인덱스만 맞으면 됩니다.
