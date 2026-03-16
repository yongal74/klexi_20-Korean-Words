import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle(): Promise<{
  success: boolean;
  error?: string;
  user?: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null;
}> {
  try {
    const redirectUrl = Linking.createURL('auth');
    console.log('[Google OAuth] redirectUrl:', redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      console.log('[Google OAuth] OAuth URL 생성 실패:', error?.message);
      return { success: false, error: error?.message || 'OAuth URL 생성 실패' };
    }

    console.log('[Google OAuth] Opening browser...');
    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl
    );

    console.log('[Google OAuth] Browser result type:', result.type);

    if (result.type !== 'success') {
      return { success: false, error: `브라우저 결과: ${result.type}` };
    }

    const url = result.url;
    console.log('[Google OAuth] Redirect URL received:', url.substring(0, 80));

    const hashParams = new URLSearchParams(url.split('#')[1] || '');
    const queryParams = new URLSearchParams(url.split('?')[1] || '');
    const access_token = hashParams.get('access_token') || queryParams.get('access_token');
    const refresh_token = hashParams.get('refresh_token') || queryParams.get('refresh_token');
    const code = queryParams.get('code');

    console.log('[Google OAuth] Has code:', !!code, '/ Has token:', !!access_token);

    let sessionUser = null;

    if (code) {
      const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(url);
      if (exchangeError || !sessionData.user) {
        console.log('[Google OAuth] Code exchange failed:', exchangeError?.message);
        return { success: false, error: exchangeError?.message || '코드 교환 실패' };
      }
      sessionUser = sessionData.user;
    } else if (access_token && refresh_token) {
      const { data: sessionData } = await supabase.auth.setSession({ access_token, refresh_token });
      sessionUser = sessionData.user;
    } else {
      console.log('[Google OAuth] No code or token in redirect URL');
      return { success: false, error: '인증 정보를 가져오지 못했어요' };
    }

    if (!sessionUser) {
      return { success: false, error: '세션 유저를 가져오지 못했어요' };
    }

    // Google OAuth 유저는 profiles 테이블에 자동 생성이 안 되므로 upsert
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', sessionUser.id)
      .single();

    if (!existing) {
      const googleName = sessionUser.user_metadata?.full_name ||
                         sessionUser.user_metadata?.name ||
                         'Learner';
      await supabase.from('profiles').insert({
        id: sessionUser.id,
        email: sessionUser.email || '',
        name: googleName,
        provider: 'google',
      });
    }

    console.log('[Google OAuth] Success!');
    return { success: true, user: sessionUser };
  } catch (err) {
    console.log('[Google OAuth] Exception:', err);
    return { success: false, error: '로그인 중 오류가 발생했어요' };
  }
}

export async function signOut() {
  await supabase.auth.signOut();
}
