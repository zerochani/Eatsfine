# 🍽️ Eatsfine FE

**Eatsfine은 '자리(좌석)'를 기준으로 레스토랑을 탐색하고 원하는 시간에 간편하게 예약까지 이어지는** 지도 기반 레스토랑 예약 웹 서비스입니다.

🔗 **Service URL**
https://www.eatsfine.co.kr

📽️ **데모 영상**
https://www.youtube.com/watch?v=Nk1_28zSJaQ

## 👥 팀 소개

| <div align="center"><strong>노바/박재선</strong></div>                                           | <div align="center"><strong>듀/함이슬</strong></div>                                                | <div align="center"><strong>서리/유설희</strong></div>                                               |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| <div align="center"><img src="https://avatars.githubusercontent.com/jjjsun" width="160" /></div> | <div align="center"><img src="https://avatars.githubusercontent.com/dew102938" width="160" /></div> | <div align="center"><img src="https://avatars.githubusercontent.com/yooseolhee" width="160" /></div> |
| <div align="center">[@jjjsun](https://github.com/jjjsun)</div>                                   | <div align="center">[@dew102938](https://github.com/dew102938)</div>                                | <div align="center">[@yooseolhee](https://github.com/yooseolhee)</div>                               |

## 🛠️ Tech Stack

- Stack: **React + TypeScript + Vite + TailwindCSS + pnpm**
- UI: **shadcn/ui**
- Routing: **react-router-dom**
- Server State: **TanStack Query**
- Form Validation: **React Hook Form + Zod**
- HTTP Client: **axios**
- Client State: **Zustand**

## 🔥 Git Commit Convention (커밋 규칙)

효율적인 협업을 위해 다음과 같은 커밋 메세지 규칙을 사용합니다.

**type은 소문자로 통일합니다.**

| 커밋 타입     | 설명                           |
| ------------- | ------------------------------ |
| 🎉 `feat`     | 새로운 기능 추가               |
| 🐛 `fix`      | 버그/오류 수정                 |
| 🛠 `chore`    | 코드/내부 파일/설정 수정       |
| 📝 `docs`     | 문서 수정 (README 등)          |
| 🔄 `refactor` | 코드 리팩토링 (기능 변경 없음) |
| 🧪 `test`     | 테스트 코드 추가/수정          |
| 🎨 `style`    | 스타일 변경(포맷, 세미콜론 등) |

💻 **예시**

```bash
git commit -m "feat: restaurant card 컴포넌트 추가"
git commit -m "fix: 네이버페이 결제수단 오류 수정"
git commit -m "style: 식당리스트 카드디자인 수정"
```

## 📁 폴더 구조

```txt
src/
  api/          # axios 인스턴스/요청 함수
  components/   # UI 컴포넌트 (도메인별 폴더 포함)
  hooks/        # 커스텀 훅
  layouts/      # 레이아웃
  lib/          # 공용 유틸 (cn 등)
  pages/        # 라우트 단위 페이지
  query/        # TanStack Query 설정
  stores/       # 전역 상태관리
  styles/       # 전역 스타일
  types/        # 전역 타입 (UI 모델)
  utils/        # 공용 유틸 함수
```

## 🌿 Branch

- main : 배포/최종 안정 브랜치 **(직접 push 금지)**
- develop: 개발 통합 브랜치 (기본 작업 브랜치)
- 작업 브랜치 네이밍:
  - `feat/mainPage`
  - `fix/myPagePath`
  - `chore/SearchPage`
  - `refactor/Header`

## 🎯 작업 루틴

기본 브랜치는 develop

작업은 항상 `develop`에서 브랜치를 따서 진행하고, PR은 develop으로 올립니다.

### 1. 작업 시작 전 (최신화)

```bash
git checkout develop
git pull --rebase origin develop
```

### 2. 작업 브랜치 생성

```bash
git checkout -b feat/featureName
```

### 3. 작업 후 커밋 & 푸시

```bash
git add .     # 필요하면 git add file명 으로 특정 파일만 추가해도 됨
git commit -m "feat: 자세한 내용 적기"
git push -u origin feat/featureName
```

### 4. PR 생성

- feat/<featureName> → develop 로 PR 생성
- PR 본문에 Closes #이슈번호 작성해서 merge 시 이슈가 자동으로 닫히도록 설정

```md
Closes #이슈번호
```

### 5. 리뷰 & 머지

- 최소 1명 리뷰 후 merge
- main은 배포/최종용 브랜치이기에 **직접 push 금지**

## 🔒 보안

- .env 및 민감정보는 절대 커밋 금지
- 공유가 필요한 환경변수는 .env.example에서 키 형태로만 관리합니다.

## 👥 팀 규칙

- **작업 시작전 develop 최신화: git pull**
- PR은 가능한 작게 쪼개서 올리기
- PR에 작업 요약 + 스크린샷/동작 설명 포함하기
- 충돌 발생 시 브랜치에서 먼저 해결 후 PR 업데이트

## 🧩 UI (shadcn/ui)

- 컴포넌트는 src/components/ui에 생성됩니다.
- className 병합 유틸은 src/lib/utils.ts의 cn()을 사용합니다.

## 💡 시작 방법

### 1. Clone & Install

```bash
git clone https://github.com/Eatsfine/FE.git
cd eatsfine-fe
pnpm i
```

### 2. Environment Values

.env는 커밋하지 않습니다. .env.example을 복사해서 사용합니다.

```bash
# macOS/Linux
cp .env.example .env
```

```bash
:: Windows (cmd)
copy .env.example .env
```

### 3. Run

```bash
pnpm dev
```

### 4. Build/Preview

```bash
pnpm build
pnpm preview
```
