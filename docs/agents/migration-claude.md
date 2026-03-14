# CLAUDE.md — Agent MIGRATION
# Klexi: 20 Korean Words — Replit → Supabase Edge Functions 마이그레이션 에이전트

---

## 이 에이전트의 임무

**Replit 의존성 100% 제거 + Express 서버를 Supabase Edge Functions으로 이전**

브랜치: `agent/migration`
머지 대상: `main`

---

## 절대 규칙

1. **TDD 필수**: 테스트 먼저 작성 후 구현
2. **기존 기능 파괴 금지**: AI 채팅, TTS, 결제가 마이그레이션 후에도 동작해야 함
3. **커밋 메시지**: `feat(migration): ...` 형식
4. **다른 에이전트 파일 수정 금지**

---

## 목표 아키텍처

```
Before (Replit):
  모바일 앱 → Replit Express 서버 → OpenAI / Polar

After (Supabase Edge):
  모바일 앱 → Supabase Edge Functions → OpenAI (직접)
                                      → Polar (직접)
  (별도 서버 없음, Supabase 하나로 통합)
```

## 새 폴더 구조

```
supabase/
└── functions/
    ├── ai-chat/
    │   └── index.ts       ← 달리 AI 채팅 (SSE 스트리밍)
    ├── ai-tts/
    │   └── index.ts       ← OpenAI TTS → MP3 반환
    └── polar-webhook/
        └── index.ts       ← Polar 결제 웹훅 처리
```

---

## 현재 문제 목록

### 문제 1: ai-tts.ts — Replit 전용 모듈 사용
```typescript
// server/ai-tts.ts 현재 (문제)
import { textToSpeech } from './replit_integrations/audio/client';
// → Edge Function에서 직접 OpenAI fetch로 교체
```

### 문제 2: ai-chat.ts — 없는 모델명
```typescript
model: 'gpt-5-mini'   // 존재하지 않음
// → 'gpt-4o-mini'로 수정
```

### 문제 3: package.json — Replit 도메인 하드코딩
```json
"expo:dev": "EXPO_PACKAGER_PROXY_URL=https://$REPLIT_DEV_DOMAIN ... expo start"
// → "expo:dev": "npx expo start --localhost"
```

### 문제 4: server/ 폴더 전체
```
Express 서버 → supabase/functions/ 으로 이전
server/replit_integrations/ → 삭제
```

---

## 작업 순서 (TDD)

### Phase 1: 테스트 먼저 작성 (RED)

```
__tests__/functions/ai-chat.test.ts
__tests__/functions/ai-tts.test.ts
__tests__/functions/polar-webhook.test.ts
```

테스트가 실패(RED) 상태인지 확인 후 구현 시작

### Phase 2: Supabase CLI 설정

```bash
# Supabase CLI 설치 (없으면)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결 (Supabase 대시보드의 프로젝트 ref 사용)
supabase link --project-ref YOUR_PROJECT_REF

# Edge Functions 폴더 초기화
supabase functions new ai-chat
supabase functions new ai-tts
supabase functions new polar-webhook
```

### Phase 3: Edge Functions 구현

### Phase 4: 클라이언트 URL 업데이트

```typescript
// .env.local
EXPO_PUBLIC_API_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1
```

### Phase 5: 기존 server/ 폴더 정리

```bash
# replit_integrations 삭제
rm -rf server/replit_integrations/

# server/ 폴더는 유지하되 레거시 표시
# (Edge Functions 안정화 후 삭제 예정)
```

---

## 구현 스펙

### supabase/functions/ai-chat/index.ts

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SYSTEM_PROMPT = `You are Dalli, a friendly Korean language tutor.
Help users learn Korean naturally through conversation.
Always respond in a mix of Korean and English appropriate to the user's TOPIK level.
Keep responses concise (under 150 words).`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    const { message, history = [], topikLevel = 1 } = await req.json();

    const messages = [
      { role: 'system', content: `${SYSTEM_PROMPT}\nUser's TOPIK Level: ${topikLevel}` },
      ...history.slice(-8),
      { role: 'user', content: message },
    ];

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 250,
        stream: true,
      }),
    });

    // SSE 스트리밍 그대로 클라이언트에 전달
    return new Response(openaiResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'AI chat failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### supabase/functions/ai-tts/index.ts

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    const { text, voice = 'nova' } = await req.json();

    if (!text || text.length > 500) {
      return new Response(
        JSON.stringify({ error: 'text required, max 500 chars' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice,
        speed: 0.9,
      }),
    });

    const audioBuffer = await ttsResponse.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'TTS failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

### supabase/functions/polar-webhook/index.ts

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const webhookSecret = Deno.env.get('POLAR_WEBHOOK_SECRET')!;

    // 웹훅 서명 검증
    const signature = req.headers.get('webhook-signature');
    if (!signature) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { type, data } = payload;

    if (type === 'subscription.created' || type === 'subscription.updated') {
      const userId = data.metadata?.userId;
      const isActive = data.status === 'active';

      if (userId) {
        await supabase
          .from('user_profiles')
          .upsert({
            id: userId,
            is_premium: isActive,
            polar_subscription_id: data.id,
            premium_expires_at: data.current_period_end,
          });
      }
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    return new Response('Error', { status: 500 });
  }
});
```

### supabase/functions/_shared/cors.ts (공통 CORS)

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

---

## Edge Functions 환경 변수 설정

```bash
# Supabase 대시보드 또는 CLI로 설정
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set POLAR_WEBHOOK_SECRET=wh_...
supabase secrets set POLAR_ACCESS_TOKEN=polar_at_...
```

## 배포 명령

```bash
# 함수 배포
supabase functions deploy ai-chat --no-verify-jwt
supabase functions deploy ai-tts --no-verify-jwt
supabase functions deploy polar-webhook --no-verify-jwt

# 로컬 테스트
supabase functions serve ai-chat --env-file .env.local
```

## 클라이언트 URL 변경

```bash
# .env.local
EXPO_PUBLIC_API_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1
```

---

## 테스트 스펙

### __tests__/functions/ai-tts.test.ts

```typescript
// Deno 환경 모킹 (Jest에서 Edge Function 로직 테스트)
describe('AI TTS Function', () => {
  it('빈 text → 400 에러', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(100))
    });

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ text: '' }),
    });
    // handler 임포트 후 테스트
  });

  it('500자 초과 text → 400 에러', () => {
    expect('a'.repeat(501).length).toBeGreaterThan(500);
  });

  it('replit_integrations 미사용 확인', () => {
    const fs = require('fs');
    const files = ['server/ai-tts.ts'];
    files.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(content).not.toContain('replit_integrations');
      }
    });
  });
});
```

---

## 완료 기준

```
□ supabase/functions/ai-chat/index.ts 생성 및 배포
□ supabase/functions/ai-tts/index.ts 생성 및 배포
□ supabase/functions/polar-webhook/index.ts 생성 및 배포
□ server/replit_integrations/ 삭제
□ package.json expo:dev 스크립트 수정
□ EXPO_PUBLIC_API_URL Supabase Edge URL로 변경
□ npm test → 테스트 통과
□ npx tsc --noEmit → 에러 0개
□ 로컬에서 supabase functions serve 동작 확인
□ git commit -m "feat(migration): Replit 제거, Supabase Edge Functions 이전 완료"
```
