# MULTI_AGENT_PLAN.md — 멀티 에이전트 개발 마스터 플랜
### Klexi: 20 Korean Words

> **전략**: 5개 에이전트 병렬 개발 → TDD → Git Worktree 기반 머지
> **총 예상 기간**: 2~3주 (에이전트 병렬 실행 시)

---

## 전체 아키텍처

```
main (항상 배포 가능)
  │
  ├── agent/migration   ← 에이전트 1: Replit → Railway 마이그레이션
  ├── agent/security    ← 에이전트 2: 보안 + TypeScript 정리
  ├── agent/auth        ← 에이전트 3: Google 소셜 로그인
  ├── agent/notify      ← 에이전트 4: 푸시 알림
  └── agent/analytics   ← 에이전트 5: Firebase Analytics

머지 순서:
security → migration → auth → notify → analytics
(security, migration은 병렬, 나머지는 순차)
```

---

## 에이전트별 담당 작업

### Agent 1: MIGRATION (우선순위 1)
**목표**: Replit 의존성 100% 제거, Railway 배포 완성

**작업 목록**:
- [ ] `server/ai-tts.ts` — replit_integrations 제거 → 직접 OpenAI TTS
- [ ] `server/ai-chat.ts` — 모델명 수정 (`gpt-5-mini` → `gpt-4o-mini`)
- [ ] `server/index.ts` — REPLIT_DOMAINS CORS 제거 → 표준 env var
- [ ] `package.json` — `expo:dev` 스크립트 REPLIT_DEV_DOMAIN 제거
- [ ] `server/replit_integrations/` — 폴더 전체 삭제
- [ ] `Dockerfile` — Railway 배포용
- [ ] `railway.json` — Railway 설정
- [ ] `.env.example` — 표준 환경 변수 템플릿

**TDD 테스트**:
- `__tests__/server/ai-chat.test.ts` — 채팅 API 엔드포인트 테스트
- `__tests__/server/ai-tts.test.ts` — TTS API 엔드포인트 테스트
- `__tests__/server/health.test.ts` — 헬스체크 테스트

---

### Agent 2: SECURITY (우선순위 1, 병렬)
**목표**: 보안 취약점 해소 + TypeScript 에러 0개

**작업 목록**:
- [ ] `.gitignore` — .env, *.aab, *.apk 추가
- [ ] `.env.example` — 예시 파일 생성
- [ ] `app/(tabs)/settings.tsx:24` — ImpactFeedbackStyle.Warning 수정
- [ ] `tsconfig.json` — replit_integrations exclude 추가
- [ ] TypeScript 에러 전체 해소 (22개)
- [ ] `server/index.ts` — rate limiting 보강 (auth 엔드포인트)

**TDD 테스트**:
- `__tests__/lib/srs.test.ts` — SRS 알고리즘 단위 테스트
- `__tests__/lib/gamification.test.ts` — 게임화 로직 테스트
- `__tests__/lib/vocabulary.test.ts` — 단어 필터링 테스트

---

### Agent 3: AUTH (우선순위 2)
**목표**: Google 소셜 로그인 실제 동작

**작업 목록**:
- [ ] `app/welcome.tsx` — Google OAuth 실제 구현
- [ ] `server/` — Google OAuth 콜백 엔드포인트
- [ ] Supabase Google provider 설정 가이드
- [ ] 딥링크 처리 (`klexi://auth?token=...`)
- [ ] iOS Sign in with Apple (EAS 빌드 연동)

**TDD 테스트**:
- `__tests__/auth/google-oauth.test.ts`
- `__tests__/auth/deep-link.test.ts`

---

### Agent 4: NOTIFY (우선순위 2)
**목표**: 매일 학습 리마인더 푸시 알림

**작업 목록**:
- [ ] `expo-notifications` 설치 및 권한 요청
- [ ] `lib/notifications.ts` — 알림 스케줄러
- [ ] `app/(tabs)/settings.tsx` — 알림 시간 설정 UI
- [ ] 자정 기준 스트릭 체크 알림
- [ ] 복습 예정 단어 알림

**TDD 테스트**:
- `__tests__/lib/notifications.test.ts`

---

### Agent 5: ANALYTICS (우선순위 3)
**목표**: 마케팅 의사결정용 Firebase Analytics

**작업 목록**:
- [ ] `@react-native-firebase/analytics` 설치
- [ ] `lib/analytics.ts` — 이벤트 추적 래퍼
- [ ] 핵심 이벤트 10개 구현:
  - word_learned, quiz_completed, streak_updated
  - premium_viewed, premium_purchased
  - ai_chat_sent, srs_reviewed
  - app_opened, level_up, achievement_unlocked
- [ ] app.json Firebase 설정

**TDD 테스트**:
- `__tests__/lib/analytics.test.ts`

---

## 머지 전략 (순서 중요)

```bash
# Step 1: security + migration (병렬 개발, 순차 머지)
git checkout main
git merge agent/security   # TypeScript 에러 없는 상태 만들기
git merge agent/migration  # Replit 제거

# Step 2: auth
git merge agent/auth

# Step 3: notify + analytics (병렬 머지 가능)
git merge agent/notify
git merge agent/analytics
```

---

## TDD 원칙

```
각 에이전트가 따르는 개발 사이클:

1. RED   — 실패하는 테스트 먼저 작성
2. GREEN — 테스트를 통과하는 최소 코드 작성
3. REFACTOR — 코드 정리 (테스트는 계속 통과)

테스트 통과 없이 머지 금지:
npm test -- --coverage 결과 80% 이상
```
