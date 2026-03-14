/**
 * Google OAuth Tests
 * Agent: AUTH
 */

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
      signOut: jest.fn(),
    },
  },
}));

jest.mock('@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import { signInWithGoogle, signOut } from '../../lib/auth';

describe('Google OAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('토큰 없이 success URL → success=false', async () => {
    const { supabase } = require('../../lib/supabase');
    const WebBrowser = require('expo-web-browser');

    supabase.auth.signInWithOAuth.mockResolvedValue({
      data: { url: 'https://accounts.google.com/...' },
      error: null,
    });
    WebBrowser.openAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'klexi://auth',
    });

    const result = await signInWithGoogle();
    expect(result.success).toBe(false);
  });

  it('signOut은 supabase.auth.signOut 호출', async () => {
    const { supabase } = require('../../lib/supabase');
    supabase.auth.signOut.mockResolvedValue({});
    await signOut();
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
