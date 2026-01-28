// Turnstile server-side verification

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export interface TurnstileResult {
  success: boolean;
  error?: string;
}

// Allowed hostnames for Turnstile verification
const ALLOWED_HOSTNAMES = ['eve0415.net', 'www.eve0415.net', 'localhost'];

export const verifyTurnstile = async (token: string, secretKey: string, remoteIp?: string): Promise<TurnstileResult> => {
  // Basic token validation
  if (!token || token.length > 2048) return { success: false, error: '認証トークンが無効です' };

  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);
  if (remoteIp) formData.append('remoteip', remoteIp);

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const result: TurnstileVerifyResponse = await response.json();

    if (!result.success) {
      const errorCodes = result['error-codes'] ?? [];

      // Map error codes to user-friendly Japanese messages
      if (errorCodes.includes('timeout-or-duplicate')) return { success: false, error: '認証がタイムアウトしました。ページを再読み込みしてください。' };

      if (errorCodes.includes('invalid-input-response')) return { success: false, error: '認証トークンが無効です。もう一度お試しください。' };

      return { success: false, error: '認証に失敗しました。もう一度お試しください。' };
    }

    // Validate hostname to prevent token replay from other origins
    if (result.hostname && !ALLOWED_HOSTNAMES.includes(result.hostname)) {
      console.warn(`Turnstile hostname mismatch: expected one of ${ALLOWED_HOSTNAMES.join(', ')}, got ${result.hostname}`);
      return { success: false, error: '認証に失敗しました。もう一度お試しください。' };
    }

    return { success: true };
  } catch {
    return { success: false, error: '認証サーバーへの接続に失敗しました。' };
  }
};
