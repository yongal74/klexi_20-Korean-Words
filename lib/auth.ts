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
  } catch {
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
