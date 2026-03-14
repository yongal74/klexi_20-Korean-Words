# Tech_Spec.md — 기술 명세서
### Klexi: 20 Korean Words (Daily-Word-Mastery)

> **버전**: v2.0 (개선판)
> **작성일**: 2026년 3월
> **기반**: 실제 코드베이스 분석 결과

---

## 1. 기술 스택 전체 맵

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Mobile / Web)                     │
│  Expo SDK 54  ·  React Native 0.81.5  ·  React 19.1         │
│  TypeScript 5.9  ·  expo-router 6  ·  React Context         │
│  AsyncStorage  ·  Reanimated 4  ·  TanStack Query 5         │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST / SSE
┌──────────────────────────▼──────────────────────────────────┐
│                     SERVER (Express.js)                      │
│  Express 5  ·  TypeScript  ·  esbuild  ·  Replit hosting    │
│  Drizzle ORM  ·  Supabase PostgreSQL                         │
│  Polar.sh (결제)  ·  OpenAI GPT-4o-mini + TTS               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 클라이언트 상세 스펙

### 2.1 프레임워크 & 라우팅

| 항목 | 현재 | 권장 |
|------|------|------|
| Framework | Expo SDK 54 | 유지 (최신) |
| React | 19.1.0 | 유지 |
| React Native | 0.81.5 | 유지 |
| Router | expo-router 6.0.17 | 유지 |
| TypeScript | 5.9.2 | 유지 |

**라우팅 구조 (expo-router 파일 기반):**
```
app/
├── _layout.tsx          # RootStack: Stack + 모달 설정
├── (tabs)/              # TabNavigator
│   ├── _layout.tsx      # 탭 바 정의 (Home, Quiz, Progress, Settings)
│   ├── index.tsx        # 홈 (학습 허브)
│   ├── quiz.tsx         # 퀴즈
│   ├── progress.tsx     # 진도
│   └── settings.tsx     # 설정
├── welcome.tsx          # 인증 (모달 presentation)
├── onboarding.tsx       # 온보딩 (card presentation)
├── word-learn.tsx       # 단어 학습 (card)
├── hangeul.tsx          # 한글 학습 (card)
├── grammar.tsx          # 문법 레퍼런스 (card)
├── theme-lessons.tsx    # 테마 레슨 (card)
├── word-network.tsx     # 단어 네트워크 (card)
├── review.tsx           # 오답 복습 (card)
├── sentence-practice.tsx # 문장 연습 (card)
├── pronunciation-practice.tsx # 발음 연습 (card)
├── daily-missions.tsx   # 데일리 미션 (card)
├── achievements.tsx     # 업적 (card)
├── custom-words.tsx     # 커스텀 단어 (card)
├── related-words-screen.tsx # 관련 단어 (card)
├── ai-chat.tsx          # AI 대화 (card)
└── premium.tsx          # 프리미엄 (modal)
```

### 2.2 상태 관리

```
상태 계층:
┌──────────────────────────────────────────────────────┐
│  React Context (AppContext.tsx) — 글로벌 앱 상태      │
│  ├── settings: 레벨, 단어수/일, 발음 설정             │
│  ├── progress: 누적 학습, 스트릭, 퀴즈 통계           │
│  ├── dailyState: 오늘 학습 완료 단어, 퀴즈 상태       │
│  ├── bookmarks: 북마크된 단어 ID 배열                 │
│  ├── customWords: 사용자 직접 추가 단어               │
│  ├── wrongAnswers: 오답 단어 빈도 맵                  │
│  ├── srsData: 간격 반복 스케줄 (SM-2 데이터)          │
│  ├── gamification: XP, 레벨, 뱃지, XP 히스토리       │
│  ├── isPremium: 프리미엄 상태 (boolean)               │
│  └── auth: Supabase 세션, 유저 ID                    │
├──────────────────────────────────────────────────────┤
│  AsyncStorage — 로컬 영속 저장                        │
│  ├── @daily_korean_settings                           │
│  ├── @daily_korean_progress                          │
│  ├── @daily_korean_daily                             │
│  ├── @daily_korean_bookmarks                         │
│  ├── @daily_korean_custom_words                      │
│  ├── @daily_korean_wrong_answers                     │
│  ├── @daily_korean_srs_data                          │
│  ├── @daily_korean_gamification                      │
│  └── @daily_korean_premium                           │
├──────────────────────────────────────────────────────┤
│  TanStack Query 5 — 서버 상태 (AI 채팅, 결제 등)      │
└──────────────────────────────────────────────────────┘
```

### 2.3 콘텐츠 데이터 구조

```typescript
// lib/vocabulary.ts — 단어 타입
interface VocabWord {
  id: string;          // 예: "n1_001"
  korean: string;      // 한국어 단어
  english: string;     // 영어 번역
  level: number;       // TOPIK 레벨 1~6
  partOfSpeech: string; // 품사 (noun, verb, adjective 등)
  example: string;     // 예문 (한국어)
  exampleTranslation: string; // 예문 번역 (영어)
  syllables: string[]; // 음절 분리 배열
  audioKey?: string;   // TTS 캐시 키 (옵션)
}

// lib/srs.ts — SM-2 알고리즘 데이터
interface SRSCard {
  wordId: string;
  easeFactor: number;   // 초기 2.5
  interval: number;     // 일 단위 (1 → 6 → 기하급수)
  repetitions: number;  // 연속 정답 횟수
  nextReview: string;   // ISO date string
  lastReview: string;
}

// lib/gamification.ts — 게임화
interface GamificationState {
  xp: number;
  level: number;        // 1~8
  achievements: string[]; // 획득한 뱃지 ID 배열
  xpHistory: { date: string; amount: number; action: string }[];
}
```

### 2.4 주요 라이브러리 목록

| 카테고리 | 라이브러리 | 버전 | 용도 |
|----------|-----------|------|------|
| 애니메이션 | react-native-reanimated | 4.1.1 | 플래시카드 뒤집기, UI 트랜지션 |
| 오디오 | expo-av | 최신 | 음성 녹음 (발음 연습) |
| TTS | expo-speech | 최신 | 기기 내장 TTS |
| 제스처 | react-native-gesture-handler | 최신 | 스와이프, 탭 |
| 그래픽 | expo-linear-gradient | 최신 | 배경 그라디언트 |
| 인증 | @supabase/supabase-js | 2.x | Auth + DB |
| 서버 상태 | @tanstack/react-query | 5.83 | API 캐싱, SSE |
| 폰트 | @expo-google-fonts/noto-sans-kr | 최신 | 한국어 렌더링 |
| 아이콘 | @expo/vector-icons | 최신 | Ionicons |
| 공유 | expo-sharing | 최신 | 네이티브 공유 시트 |

---

## 3. 서버 상세 스펙

### 3.1 서버 아키텍처

```
server/
├── index.ts          # Express 앱 (포트 5000)
│   ├── 미들웨어: compression, cors, rate-limit (100/min), security headers
│   ├── /api/ai-chat  → ai-chat.ts (SSE 스트리밍)
│   ├── /api/ai-tts   → ai-tts.ts (MP3 반환)
│   ├── /api/polar/*  → polar.ts (결제 웹훅, checkout)
│   └── /api/*        → routes.ts (기타)
├── ai-chat.ts        # OpenAI GPT-4o-mini 프록시
├── ai-tts.ts         # OpenAI TTS 프록시 (nova 목소리)
├── polar.ts          # Polar 결제 + 웹훅 처리
├── storage.ts        # Drizzle ORM 쿼리
└── routes.ts         # 라우트 등록기
```

### 3.2 API 엔드포인트 명세

#### POST /api/ai-chat
```
요청: { message: string, history: Message[], userId?: string }
응답: SSE 스트림 (text/event-stream)
  data: {"content": "...", "done": false}
  data: {"done": true}
인증: userId 기반 무료/프리미엄 확인
```

#### POST /api/ai-tts
```
요청: { text: string, voice?: "nova"|"alloy"|"echo" }
응답: audio/mpeg (MP3 바이너리)
모델: tts-1 (저지연), 속도 0.9, 피치 1.05
```

#### POST /api/polar/checkout
```
요청: { planId: string, userId: string, email: string }
응답: { checkoutUrl: string }
```

#### POST /api/polar/webhook
```
요청: Polar 웹훅 페이로드 (Stripe-like)
응답: 200 OK
처리: 구독 상태 → Supabase 업데이트
```

### 3.3 데이터베이스 스키마

```sql
-- Supabase PostgreSQL (Drizzle ORM)

-- 현재 구현된 테이블
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255)
);

-- Supabase Auth 자동 생성
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email VARCHAR,
  created_at TIMESTAMPTZ
);

-- 권장 추가 테이블 (미구현 → 구현 필요)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name VARCHAR(100),
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  polar_subscription_id VARCHAR(255),
  topik_level INTEGER DEFAULT 1,
  words_per_day INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_progress_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  data JSONB NOT NULL,  -- AppContext 상태 직렬화
  synced_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. 현재 코드베이스 기술 문제점 & 수정 방법

### 4.1 TypeScript 컴파일 에러 (22개)

**문제 1: `ImpactFeedbackStyle.Warning` 없음**
```typescript
// 현재 (app/(tabs)/settings.tsx:24)
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Warning);

// 수정 — Warning은 없음, Medium 또는 Heavy 사용
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
```

**문제 2: Replit 통합 모듈 타입 오류 (18개)**
```bash
# server/replit_integrations/ 폴더 전체가 사용되지 않으면서 오류 유발
# 해결 옵션 A: 폴더 삭제 (미사용 확인 후)
rm -rf server/replit_integrations/

# 해결 옵션 B: tsconfig.json exclude 추가
{
  "exclude": ["server/replit_integrations"]
}
```

### 4.2 보안 취약점

**문제: `.env` git 추적 위험**
```bash
# 즉시 실행
# 1. .gitignore에 .env 추가 (이미 있는지 확인)
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# 2. git history에서 민감정보 제거
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' HEAD

# 3. Supabase 대시보드에서 API 키 로테이션
# 4. 새 키를 .env.local에 저장 (git 추적 제외)
```

### 4.3 AI TTS 비용 관리

**문제: 무료 사용자도 서버 TTS 호출 가능 → 비용 무제한**
```typescript
// server/ai-tts.ts 수정 예시
app.post('/api/ai-tts', async (req, res) => {
  const { text, userId } = req.body;

  // 무료 사용자 체크 추가
  const isPremium = await checkUserPremium(userId);
  if (!isPremium) {
    return res.status(403).json({
      error: 'TTS requires premium subscription',
      useDeviceTTS: true  // 클라이언트에서 expo-speech 사용하도록
    });
  }
  // ... OpenAI TTS 호출
});
```

### 4.4 오프라인 동기화 개선

```typescript
// lib/sync.ts — 현재: fire-and-forget
// 개선: 실패 시 로컬 큐에 저장
const SYNC_QUEUE_KEY = '@daily_korean_sync_queue';

export async function syncWithRetry(data: SyncData, userId: string) {
  try {
    await pushSyncData(data, userId);
  } catch (error) {
    // 큐에 추가
    const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    const pendingItems = queue ? JSON.parse(queue) : [];
    pendingItems.push({ data, timestamp: Date.now() });
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(pendingItems));
  }
}

// 앱 포그라운드 복귀 시 큐 처리
export async function flushSyncQueue(userId: string) {
  const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
  if (!queue) return;
  const items = JSON.parse(queue);
  for (const item of items) {
    await pushSyncData(item.data, userId);
  }
  await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
}
```

### 4.5 광고 플레이스홀더 처리

```typescript
// components/AdBanner.tsx — 현재: 빈 컴포넌트 또는 플레이스홀더
// 옵션 A: AdMob 실 연동 (expo-ads-admob 또는 react-native-google-mobile-ads)
// 옵션 B: 프리미엄 업그레이드 CTA 배너로 대체 (더 높은 전환율 기대)

// 권장: 무료 사용자에게 프리미엄 유도 배너 표시
export function AdBanner({ location }: { location: string }) {
  const { isPremium } = useApp();
  if (isPremium) return null;

  return (
    <TouchableOpacity onPress={() => router.push('/premium')}
      style={styles.premiumBanner}>
      <Text>🌟 Premium으로 업그레이드하여 광고 없이 학습하세요</Text>
    </TouchableOpacity>
  );
}
```

---

## 5. 환경 변수 명세

### 클라이언트 (`.env.local`)
```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# 서버 주소
EXPO_PUBLIC_API_URL=https://your-server.replit.app/api
```

### 서버 (Replit Secrets / `.env.local`)
```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Polar 결제
POLAR_ACCESS_TOKEN=polar_at_...
POLAR_WEBHOOK_SECRET=wh_...

# Supabase 서버용 (service role)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_URL=https://xxxx.supabase.co

# 데이터베이스
DATABASE_URL=postgresql://...
```

---

## 6. 성능 최적화 가이드

### 앱 번들 크기
- 현재 AAB: ~93MB (정상 범위, Expo SDK 포함)
- vocab 데이터를 앱 번들에서 Supabase로 이관 시 ~20MB 절감 가능
- 사용하지 않는 replit_integrations 제거 시 서버 번들 감소

### 이미지/폰트 최적화
```json
// app.json — 현재 설정
{
  "expo": {
    "splash": { "resizeMode": "contain" },
    "assetBundlePatterns": ["**/*"]
  }
}

// 개선: 필요한 asset만 번들링
{
  "assetBundlePatterns": [
    "assets/images/*",
    "assets/fonts/*"
  ]
}
```

### 메모리 누수 방지
```typescript
// 오디오 리소스는 반드시 언로드
useEffect(() => {
  return () => {
    if (soundRef.current) {
      soundRef.current.unloadAsync();
    }
  };
}, []);
```

---

## 7. 테스트 전략

### 단위 테스트 (필수 구현)
```bash
npm install --save-dev jest @testing-library/react-native
```

```typescript
// __tests__/srs.test.ts
describe('SM-2 Algorithm', () => {
  it('초기 카드 interval = 1일', () => {
    const card = createSRSCard('word_001');
    expect(card.interval).toBe(1);
  });

  it('정답 연속 2회 후 interval = 6일', () => {
    const card = updateSRSCard(card, 4); // quality 4 = 정답
    const card2 = updateSRSCard(card, 4);
    expect(card2.interval).toBe(6);
  });
});
```

### E2E 테스트 (권장)
- Detox (React Native E2E) 또는 EAS Device Testing 활용
- 핵심 시나리오: 단어 학습 → 퀴즈 → 진도 확인

---

## 8. 모니터링 & 로깅

### 클라이언트 에러 트래킹 (미구현 → 구현 권장)
```bash
npx expo install @sentry/react-native
```

```typescript
// app/_layout.tsx
import * as Sentry from '@sentry/react-native';
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
});
```

### Firebase Analytics (미구현 → 구현 권장)
```bash
npx expo install @react-native-firebase/analytics
```

```typescript
// 주요 이벤트 추적
analytics().logEvent('word_learned', { wordId, level, topikLevel });
analytics().logEvent('quiz_completed', { score, total, xpEarned });
analytics().logEvent('premium_purchased', { plan, amount });
```
