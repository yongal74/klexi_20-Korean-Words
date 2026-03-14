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

      // PKCE flow: Supabase returns ?code=... → exchange for session
      // Legacy flow: Supabase returns #access_token=... → set session directly
      let sessionUser = null;

      const hashParams = new URLSearchParams(url.split('#')[1] || '');
      const queryParams = new URLSearchParams(url.split('?')[1] || '');
      const access_token = hashParams.get('access_token') || queryParams.get('access_token');
      const refresh_token = hashParams.get('refresh_token') || queryParams.get('refresh_token');
      const code = queryParams.get('code');

      if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(url);
        if (exchangeError || !data.user) {
          return { success: false, error: exchangeError?.message || '코드 교환 실패' };
        }
        sessionUser = data.user;
      } else if (access_token && refresh_token) {
        const { data } = await supabase.auth.setSession({ access_token, refresh_token });
        sessionUser = data.user;
      } else {
        return { success: false, error: '로그인이 취소됐거나 실패했어요' };
      }

      // Google OAuth 유저는 profiles 테이블에 자동 생성이 안 되므로 upsert
      if (sessionUser) {
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
      }

      return { success: true };
    }

    return { success: false, error: '로그인이 취소됐거나 실패했어요' };
  } catch {
    return { success: false, error: '로그인 중 오류가 발생했어요' };
  }
}

export async function signOut() {
  await supabase.auth.signOut();
}
