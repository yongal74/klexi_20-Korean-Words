# Build_and_Release_Guide.md — 빌드·배포·스토어 등록 가이드
### Klexi: 20 Korean Words

> **버전**: v2.0
> **작성일**: 2026년 3월
> **대상**: 1인 개발자 기준, Android 우선

---

## 1. 로컬 개발 환경 설정

### 1.1 필수 도구 설치

```bash
# Node.js 22+ (LTS)
# https://nodejs.org

# Expo CLI
npm install -g expo-cli eas-cli

# 버전 확인
node -v     # v22.x
npm -v      # 10.x
eas --version  # 15.x
expo --version  # 7.x
```

### 1.2 프로젝트 초기 설정

```bash
cd C:\Users\장우경\TwentyKorean\Daily-Word-Mastery

# 의존성 설치
npm install

# .env.local 생성 (절대 git에 올리지 말 것!)
cp .env .env.local
# .env.local에 실제 키 입력:
# EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# EXPO_PUBLIC_API_URL=https://your-server.replit.app/api

# .gitignore 확인
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "*.aab" >> .gitignore
echo "*.apk" >> .gitignore
```

### 1.3 개발 서버 실행

```bash
# 1. 백엔드 서버 (별도 터미널)
npm run server:dev
# → http://localhost:5000 에서 실행

# 2. 모바일 앱 (Metro 번들러)
npm run expo:dev
# → Expo Go 앱에서 QR 스캔 or 에뮬레이터 연결

# Android 에뮬레이터에서 바로 실행
npx expo run:android

# iOS 시뮬레이터 (Mac 필요)
npx expo run:ios
```

---

## 2. EAS 빌드 설정

### 2.1 EAS 로그인 & 프로젝트 연결

```bash
# EAS 로그인 (expo.dev 계정 필요)
eas login

# 프로젝트 초기화 (최초 1회)
eas init --id your-project-id
# app.json의 extra.eas.projectId와 일치해야 함
```

### 2.2 eas.json 현재 구조 분석 및 개선

```json
// eas.json (현재 + 개선)
{
  "cli": {
    "version": ">= 15.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "http://192.168.x.x:5000/api"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://xxxx.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJ...",
        "EXPO_PUBLIC_API_URL": "https://staging-server.replit.app/api"
      }
    },
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://xxxx.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJ...",
        "EXPO_PUBLIC_API_URL": "https://your-server.replit.app/api"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### 2.3 빌드 실행

```bash
# Android 프로덕션 빌드 (Google Play용 AAB)
eas build --platform android --profile production

# iOS 프로덕션 빌드 (App Store용 IPA)
eas build --platform ios --profile production

# 두 플랫폼 동시 빌드
eas build --platform all --profile production

# 빌드 상태 확인
eas build:list

# 빌드 로그 확인
eas build:view [BUILD_ID]
```

### 2.4 APK 빠른 테스트용 빌드

```bash
# 내부 테스트용 APK (QA, 팀 배포)
eas build --platform android --profile preview

# 빌드 완료 후 다운로드
eas build:download --platform android
```

---

## 3. 버전 관리 전략

### 3.1 버전 번호 체계

```
앱 버전: [MAJOR].[MINOR].[PATCH]
예시: 1.2.3

MAJOR: 전체 UI 개편, 주요 기능 추가 (수동 증가)
MINOR: 새 기능 추가 (수동 증가)
PATCH: 버그 수정, 소형 개선 (수동 증가)

versionCode / buildNumber: EAS autoIncrement 사용 (자동)
```

### 3.2 app.json 버전 설정

```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 5
    },
    "ios": {
      "buildNumber": "5"
    }
  }
}
```

### 3.3 Git 태그 전략

```bash
# 배포 전 태그 생성
git tag -a v1.0.1 -m "Release v1.0.1: 버그 수정 및 성능 개선"
git push origin v1.0.1

# 태그 목록 확인
git tag -l
```

---

## 4. GitHub 워크플로우

### 4.1 브랜치 전략 (현재 → 개선)

```
현재: master 브랜치만 사용
개선: GitHub Flow 채택

main (배포 브랜치, 항상 안정)
  ↑ merge via PR
feature/push-notifications   # 새 기능
fix/typescript-errors         # 버그 수정
chore/upgrade-expo-54         # 의존성 업그레이드
```

### 4.2 GitHub Actions 자동 빌드

```yaml
# .github/workflows/build.yml
name: EAS Build on Push to Main

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    name: EAS Android Build
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build Android (Production)
        run: eas build --platform android --profile production --non-interactive
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          EXPO_PUBLIC_API_URL: ${{ secrets.API_URL }}

      - name: Submit to Google Play (태그 푸시 시만)
        if: startsWith(github.ref, 'refs/tags/v')
        run: eas submit --platform android --latest --non-interactive
```

### 4.3 GitHub Secrets 설정

```
GitHub 레포 → Settings → Secrets → Actions에 다음 추가:
- EXPO_TOKEN: expo.dev에서 발급한 액세스 토큰
- SUPABASE_URL: Supabase 프로젝트 URL
- SUPABASE_ANON_KEY: Supabase anon key
- API_URL: 서버 URL
```

---

## 5. Google Play Store 등록 가이드

### 5.1 Google Play Console 초기 설정

```
1. play.google.com/console → 개발자 계정 생성 ($25 일회성)
2. "앱 만들기" 클릭
   - 앱 이름: Klexi: 20 Korean Words
   - 기본 언어: 한국어 or 영어 (주 타깃에 따라)
   - 앱 또는 게임: 앱
   - 무료 또는 유료: 무료 (인앱 구매 포함)
3. 콘텐츠 등급 설문 완료 → PEGI 3 or Everyone 획득
4. 타깃 독자 및 콘텐츠 정책 완료
```

### 5.2 스토어 등록정보 (ASO 최적화)

```
앱 이름 (30자 이내):
Klexi: Learn 20 Korean Words

짧은 설명 (80자 이내):
Learn Korean fast! 20 words/day, TOPIK prep, AI tutor, K-Culture themes

긴 설명 (4,000자):
---
Master Korean in 6 months with Klexi — the most systematic Korean vocabulary app.

🎯 TOPIK-ALIGNED CURRICULUM
• 7,200 words across all 6 TOPIK levels
• Structured daily lessons (20 words/day)
• Track your progress toward TOPIK certification

🧠 SMART LEARNING TECHNOLOGY
• Spaced Repetition System (SM-2 algorithm) — never forget a word
• Personalized review schedule based on your performance
• Wrong answer tracking and targeted review

🎭 K-CULTURE IMMERSION
• K-Drama vocabulary (사랑해, 오빠, 파이팅!)
• K-Pop terms and fan culture language
• K-Food, Travel, Internet Slang, Korean Manners
• Learn words in their cultural context

🤖 AI KOREAN TUTOR "DALLI"
• Practice real conversations 24/7
• Instant corrections and explanations
• Native Korean pronunciation (OpenAI TTS)

📊 GAMIFIED LEARNING
• XP points and 8 levels to unlock
• 15 achievement badges
• Daily missions and streaks

✍️ COMPLETE KOREAN TOOLKIT
• Hangeul alphabet — learn to read/write in 1 hour
• 108 grammar patterns (all TOPIK levels)
• Pronunciation practice with recording
• Sentence construction exercises

💎 PREMIUM SUBSCRIPTION
• Monthly: $7.99 | Yearly: $49.99 (save 48%) | Lifetime: $99.99
• Unlock all TOPIK levels, K-Culture themes, unlimited AI chat

Start your Korean journey today — 하루 20단어, 6개월 후엔 한국어로!
---

카테고리: Education (교육)
태그: Korean, TOPIK, K-Culture, Language Learning, Vocabulary
```

### 5.3 스크린샷 제작 가이드

```
필수 스크린샷 크기:
- 폰: 1080×1920 (16:9) 최소 2장, 최대 8장
- 태블릿: 1200×1920 (선택)

권장 스크린샷 순서 (전환율 최적화):
1. 홈 화면 — "하루 20단어" 진행 바 + 스트릭
2. 단어 학습 — 플래시카드 (한국어 단어 + 음절 분리)
3. AI 튜터 달리 — 대화 화면
4. K-컬처 테마 — K-드라마 단어 목록
5. 퀴즈 결과 — XP 획득 + 레벨업 화면
6. 진도 화면 — 스트릭 캘린더 + 통계

도구: Figma + 실제 스크린샷 합성
     또는 Previewed.app (자동 목업 생성)
```

### 5.4 출시 단계별 전략

```
1단계: 내부 테스트 (Internal Testing)
   - 대상: 개인 Gmail 계정 최대 100명
   - 기간: 1~2주
   - 목적: 크래시, 결제 플로우 검증

2단계: 비공개 테스트 (Closed Testing / Alpha)
   - 대상: 초대한 테스터 (베타 사용자 모집)
   - 기간: 2~4주
   - 목적: UX 피드백, 버그 수집

3단계: 공개 테스트 (Open Testing / Beta)
   - 대상: 누구나 참여 가능
   - 기간: 2~4주
   - 목적: 리뷰 수집, 평점 관리

4단계: 프로덕션 출시 (Production)
   - 단계별 출시 (10% → 50% → 100%)
   - 크래시율 모니터링 후 단계 확대
```

---

## 6. Apple App Store 등록 가이드

### 6.1 Apple Developer 설정

```bash
# Apple Developer Program: 연 $99 (개인)
# https://developer.apple.com

# EAS iOS 빌드 (Mac 필요 없음 — EAS 클라우드 빌드)
eas build --platform ios --profile production

# App Store Connect에 자동 제출
eas submit --platform ios --latest
```

### 6.2 App Store Connect 설정

```
앱 이름: Klexi: 20 Korean Words
부제목 (30자): Learn TOPIK Korean Daily
카테고리: Education > Language Learning

키워드 (100자, 쉼표 구분):
Korean,TOPIK,vocabulary,K-drama,Korean language,한국어,learn Korean,flashcard,SRS

프라이버시 정책 URL 필수:
https://your-domain.com/privacy

In-App Purchase 설정:
- Monthly Premium: $7.99/month (Auto-Renewable)
- Yearly Premium: $49.99/year (Auto-Renewable)
- Lifetime Premium: $99.99 (Non-Consumable)
```

### 6.3 App Store 심사 주의사항

```
⚠️ Klexi 앱 심사 주요 체크포인트:

1. 인앱 결제 (IAP)
   - Apple은 구독/인앱 결제를 반드시 StoreKit으로 처리해야 함
   - Polar.sh는 웹 결제 → App Store 앱 내에서는 사용 불가
   - 해결: iOS 빌드에서는 RevenueCat + StoreKit 사용 필수
   - Android: Polar.sh 유지 가능

2. 소셜 로그인
   - Apple 로그인 제공 시 Sign in with Apple 반드시 구현 (Guideline 4.8)
   - 현재 Apple 로그인 플레이스홀더만 있음 → 구현 필요

3. AI 콘텐츠 정책
   - AI 생성 콘텐츠임을 명시 필요
   - 부적절한 AI 응답 필터링 구현 여부 확인

4. 개인정보 처리방침
   - 영어/한국어 이중 언어 Privacy Policy 페이지 필요
   - 수집 항목 명시: 이메일, 학습 데이터, 결제 정보
```

---

## 7. OTA (Over-The-Air) 업데이트

### 7.1 EAS Update 설정

```bash
# EAS Update 사용 (JS 코드 변경만, 네이티브 코드 변경 아닐 때)
npx expo install expo-updates

# 업데이트 배포 (스토어 심사 불필요)
eas update --branch production --message "버그 수정: 퀴즈 오답 카운트"

# 채널별 업데이트
eas update --branch preview --message "베타 테스트 업데이트"
```

### 7.2 OTA 가능/불가 구분

```
OTA 가능 (즉시 배포):
✅ JS/TS 코드 변경
✅ 앱 로직 변경
✅ 텍스트 수정
✅ API URL 변경
✅ 스타일 변경

OTA 불가 (스토어 심사 필요):
❌ 네이티브 코드 변경
❌ 새 Expo 모듈 추가
❌ app.json 변경
❌ 새 네이티브 권한 추가
```

---

## 8. 릴리즈 체크리스트

### 배포 전 필수 확인 (Pre-release Checklist)

```
□ TypeScript 에러 0개
  → npx tsc --noEmit

□ ESLint 경고 없음
  → npm run lint

□ .env 파일 git 미포함 확인
  → git status (tracked 파일 확인)

□ 프로덕션 API URL 설정 확인
  → EXPO_PUBLIC_API_URL 값 확인

□ 버전 번호 증가 확인
  → app.json version, versionCode

□ Supabase 연결 테스트
  → 로그인/회원가입 동작 확인

□ 결제 플로우 테스트 (Polar sandbox)
  → 체크아웃 → 웹훅 → isPremium 변경 확인

□ 오프라인 동작 확인
  → 에어플레인 모드에서 기본 학습 가능 여부

□ 크래시 없음 (주요 5개 화면 순회)
  → 홈, 단어학습, 퀴즈, 설정, AI채팅

□ 앱 아이콘 / 스플래시 정상 표시
  → assets/icon.png, splash.png 확인

□ 스크린샷 최신 버전으로 업데이트
  → 스토어 등록 이미지 갱신 여부
```

---

## 9. 모니터링 & 크래시 대응

### 9.1 Sentry 연동 (권장)

```bash
npx expo install @sentry/react-native
eas init --sentry-dsn your-sentry-dsn
```

```typescript
// app/_layout.tsx
import * as Sentry from '@sentry/react-native';
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,  // 20% 성능 트레이싱
});
```

### 9.2 배포 후 모니터링 항목

```
매일 확인:
- Sentry 크래시 레이트 (목표: < 0.1%)
- Supabase 대시보드 (DB 연결, 인증 오류)
- OpenAI 사용량 (비용 급증 여부)
- Polar 결제 실패율

주간 확인:
- Google Play Console → Android vitals (ANR, 크래시)
- App Store Connect → 충돌 보고서
- 리뷰/평점 변화
- MAU, 신규 설치, 제거율
```

---

## 10. 긴급 수정 (Hotfix) 프로세스

```bash
# 1. 긴급 브랜치 생성
git checkout -b hotfix/v1.0.2-crash-fix main

# 2. 수정 작업

# 3. JS만 변경 시 → OTA 즉시 배포 (심사 불필요)
eas update --branch production --message "핫픽스: 퀴즈 크래시 수정"

# 4. 네이티브 변경 필요 시 → 긴급 스토어 빌드
eas build --platform android --profile production
eas submit --platform android --latest

# 5. 기록
git tag -a v1.0.2 -m "Hotfix: 퀴즈 크래시 수정"
git push origin main --tags
```
