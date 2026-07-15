export async function verifyRecaptcha(token: string | undefined): Promise<{ success: boolean; errorCodes?: string[] }> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { success: false, errorCodes: ['missing-secret'] };
  if (!token) return { success: false, errorCodes: ['missing-input-response'] };

  const params = new URLSearchParams({ secret, response: token });
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
  return { success: data.success, errorCodes: data['error-codes'] };
}
