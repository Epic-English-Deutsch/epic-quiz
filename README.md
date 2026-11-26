# EPIC QUIZ · 2026년 10월 고2 영어 변형문제

2026학년도 10월 고2 전국연합학력평가(2026.10.20 시행, 경기도교육청 주관) 영어 영역 **29~42번** 지문으로 만든
어법·독해 변형문제 웹 앱입니다. 빌드 도구 없이 정적 파일만으로 동작하므로 GitHub Pages에서 바로 실행됩니다.

- 지문 출처: EBSi 공식 문제지·정답 및 해설 (2026학년도 10월 고2 전국연합학력평가 영어 영역)
- 문항: 3개 유형 · 지문 13편(41·42번은 공통 지문) 기준

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
```

## 문항 수정 방법

`data/*.js`의 항목을 직접 고치면 됩니다.

- 어법: `paragraphs` 안의 `{{1}}` 위치에 `blanks`의 1번 선택지가 들어갑니다. `answer`는 정답 인덱스(0부터).
- 빈칸 객관식: `{{B}}`가 빈칸 자리, `options`와 `answer`로 채점합니다.
- 객관식: `options` 5개, `answer` 인덱스.
- 보기 순서는 문항 id를 기준으로 자동 섞이므로, `options` 배열 순서를 바꿔도 정답 인덱스만 맞으면 됩니다.
