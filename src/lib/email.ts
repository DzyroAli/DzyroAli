/**
 * Минимальный отправитель писем через Resend HTTP API.
 *
 * Требует переменные окружения:
 *   RESEND_API_KEY — ключ API Resend (https://resend.com)
 *   EMAIL_FROM     — подтверждённый адрес отправителя, напр. "TechRadar.uz <hi@techradar.uz>"
 *
 * Если ключ не задан — функция тихо ничего не делает (no-op), поэтому
 * комментирование работает и без настроенной почты.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return res.ok;
  } catch {
    // Сеть/провайдер недоступны — не роняем вызывающий код.
    return false;
  }
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}
