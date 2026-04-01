import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

/** Send OTP to phone number (format: +919876543210) */
export async function sendOTP(phone: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw error;
}

/** Verify OTP — returns user on success */
export async function verifyOTP(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data.user;
}

/** Sign in with Google OAuth via browser */
export async function signInWithGoogle(): Promise<void> {
  const redirectTo = AuthSession.makeRedirectUri({ scheme: 'udharbook' });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error('Google login URL nahi mila');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'success') {
    const url = result.url;
    // Extract tokens from redirect URL
    const params = new URLSearchParams(url.split('#')[1] ?? url.split('?')[1] ?? '');
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      throw new Error('Login tokens nahi mile — dobara try karo');
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError) throw sessionError;
  } else if (result.type === 'cancel') {
    throw new Error('LOGIN_CANCELLED');
  }
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
