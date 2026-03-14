# CLAUDE.md — Agent AUTH
# Klexi: 20 Korean Words — Google 소셜 로그인 에이전트

---

## 이 에이전트의 임무

**Google OAuth 소셜 로그인 실제 동작 구현 (현재 UI만 있고 미동작)**

브랜치: `agent/auth`
머지 대상: `main` (migration 머지 후)
의존: migration 에이전트의 Supabase Edge Functions 설정 완료 후 시작

---

## 절대 규칙

1. **TDD 필수**: 테스트 먼저
2. **Supabase Auth 사용**: 직접 Google API 호출 금지 (Supabase가 처리)
3. **커밋 메시지**: `feat(auth): ...`
4. **Apple 로그인은 이 에이전트 범위 밖** (iOS EAS 빌드 시 별도 작업)

---

## 현재 상태 분석

```typescript
// app/welcome.tsx 현재 (문제)
<TouchableOpacity onPress={() => console.log('Google login')}>
  Google로 로그인
</TouchableOpacity>
// → 실제 동작 없음, console.log만 있음
```

---

## 목표 구현 (Supabase OAuth + expo-web-browser)

```
흐름:
1. 사용자: "Google로 로그인" 탭
2. 앱: Supabase OAuth URL 생성
3. 앱: expo-web-browser로 URL 열기 (외부 브라우저)
4. 사용자: Google 계정 선택
5. Google: klexi://auth?token=xxx 딥링크로 리디렉트
6. 앱: Linking.addEventListener로 수신
7. 앱: token으로 Supabase 세션 생성
8. AppContext: auth 상태 업데이트
```

---

## 작업 목록 (TDD 순서)

### Phase 1: 테스트 작성 (RED)

```
__tests__/auth/google-oauth.test.ts
__tests__/auth/deep-link.test.ts
__tests__/auth/auth-context.test.ts
```

### Phase 2: 의존성 확인

```bash
# 이미 설치됨 확인
npx expo install expo-web-browser
npx expo install expo-linking

# Supabase 설정 확인
cat lib/supabase.ts
```

### Phase 3: app.json 딥링크 설정

```json
{
  "expo": {
    "scheme": "klexi",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{ "scheme": "klexi" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### Phase 4: Supabase 대시보드 설정 (수동 작업 — 사용자가 직접)

```
Supabase Dashboard → Authentication → Providers → Google:
  - Client ID: [Google Cloud Console에서 발급]
  - Client Secret: [Google Cloud Console에서 발급]
  - Redirect URL: klexi://auth (등록)

Supabase Dashboard → Authentication → URL Configuration:
  - Site URL: klexi://
  - Redirect URLs에 추가: klexi://auth
```

### Phase 5: 구현

---

## 구현 스펙

### lib/auth.ts (신규)

```typescript
import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const redirectUrl = Linking.createURL('auth');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      return { success: false, error: error?.message || 'OAuth URL 생성 실패' };
    }

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl
    );

    if (result.type === 'success') {
      const url = result.url;
      const { access_token, refresh_token } = parseAuthTokens(url);

      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
        return { success: true };
      }
    }

    return { success: false, error: '로그인이 취소됐거나 실패했어요' };
  } catch (error) {
    return { success: false, error: '로그인 중 오류가 발생했어요' };
  }
}

function parseAuthTokens(url: string) {
  const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1] || '');
  return {
    access_token: params.get('access_token') || undefined,
    refresh_token: params.get('refresh_token') || undefined,
  };
}

export async function signOut() {
  await supabase.auth.signOut();
}
```

### app/welcome.tsx — Google 버튼 수정

```typescript
import { signInWithGoogle } from '../lib/auth';

// 기존 console.log 버튼을 교체
const handleGoogleLogin = async () => {
  setLoading(true);
  const { success, error } = await signInWithGoogle();
  setLoading(false);

  if (success) {
    router.replace('/');
  } else {
    Alert.alert('로그인 실패', error || '다시 시도해주세요');
  }
};

// JSX
<TouchableOpacity
  onPress={handleGoogleLogin}
  disabled={loading}
  accessibilityLabel="Google로 로그인"
>
  {loading ? <ActivityIndicator /> : <Text>Google로 로그인</Text>}
</TouchableOpacity>
```

---

## 테스트 스펙

### __tests__/auth/google-oauth.test.ts

```typescript
import { signInWithGoogle } from '../../lib/auth';

// 모킹
jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn().mockReturnValue('klexi://auth'),
}));

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
      setSession: jest.fn(),
    },
  },
}));

describe('Google OAuth', () => {
  it('OAuth URL 생성 실패 시 error 반환', async () => {
    const { supabase } = require('../../lib/supabase');
    supabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: null },
      error: { message: 'Failed' },
    });

    const result = await signInWithGoogle();
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('브라우저 취소 시 success=false 반환', async () => {
    const { supabase } = require('../../lib/supabase');
    const WebBrowser = require('expo-web-browser');

    supabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://accounts.google.com/...' },
      error: null,
    });

    WebBrowser.openAuthSessionAsync.mockResolvedValue({ type: 'cancel' });

    const result = await signInWithGoogle();
    expect(result.success).toBe(false);
  });

  it('성공 시 supabase.auth.setSession 호출', async () => {
    const { supabase } = require('../../lib/supabase');
    const WebBrowser = require('expo-web-browser');

    supabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://accounts.google.com/...' },
      error: null,
    });

    WebBrowser.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'klexi://auth#access_token=abc&refresh_token=def',
    });

    supabase.auth.setSession.mockResolvedValue({ data: {}, error: null });

    const result = await signInWithGoogle();
    expect(result.success).toBe(true);
    expect(supabase.auth.setSession).toHaveBeenCalledWith({
      access_token: 'abc',
      refresh_token: 'def',
    });
  });
});
```

---

## 완료 기준

```
□ npm test -- --testPathPattern="auth" → 모든 테스트 통과
□ app/welcome.tsx Google 버튼이 실제 OAuth 흐름 실행
□ 딥링크 klexi://auth 처리 동작
□ 로그인 후 AppContext auth 상태 업데이트 확인
□ 로그아웃 동작 확인
□ git commit -m "feat(auth): Google OAuth 소셜 로그인 구현"
```
