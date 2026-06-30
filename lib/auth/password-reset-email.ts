import type { SupportedLocale } from "../i18n/config";
import { DEFAULT_LOCALE } from "../i18n/config";

export const RESEND_EMAIL_API_URL = "https://api.resend.com/emails";
export const PASSWORD_RESET_EMAIL_SUBJECT = "Reset your DocuMind password";

const passwordResetEmailCopy: Record<
  SupportedLocale,
  {
    button: string;
    fallback: string;
    greeting: string;
    greetingNamed: (name: string) => string;
    ignore: string;
    intro: string;
    subject: string;
  }
> = {
  en: {
    button: "Reset password",
    fallback: "If the button does not work, open this URL:",
    greeting: "Hi,",
    greetingNamed: (name) => `Hi ${name},`,
    ignore: "If you did not request this, you can ignore this email.",
    intro:
      "Use the link below to set a new password. The link expires soon and can be used once.",
    subject: PASSWORD_RESET_EMAIL_SUBJECT,
  },
  ja: {
    button: "パスワードを再設定",
    fallback: "ボタンが動作しない場合は、このURLを開いてください:",
    greeting: "こんにちは。",
    greetingNamed: (name) => `${name}さん、こんにちは。`,
    ignore: "このリクエストに心当たりがない場合は、このメールを無視してください。",
    intro:
      "下のリンクから新しいパスワードを設定してください。リンクはまもなく期限切れになり、一度だけ使用できます。",
    subject: "DocuMindのパスワードを再設定",
  },
  ko: {
    button: "비밀번호 재설정",
    fallback: "버튼이 작동하지 않으면 이 URL을 여세요:",
    greeting: "안녕하세요.",
    greetingNamed: (name) => `${name}님, 안녕하세요.`,
    ignore: "이 요청을 하지 않았다면 이 이메일을 무시하셔도 됩니다.",
    intro:
      "아래 링크로 새 비밀번호를 설정하세요. 링크는 곧 만료되며 한 번만 사용할 수 있습니다.",
    subject: "DocuMind 비밀번호 재설정",
  },
};

type PasswordResetEmailOptions = {
  env?: NodeJS.ProcessEnv;
  fetcher?: typeof fetch;
  locale?: SupportedLocale;
  resetUrl: string;
  to: string;
  userName?: string | null;
};

type PasswordResetEmailResult =
  | {
      sent: true;
    }
  | {
      sent: false;
      skippedReason: "not_configured";
    };

function readEnvValue(env: NodeJS.ProcessEnv, key: string) {
  return env[key]?.trim() || null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readEmailCopy(locale: SupportedLocale = DEFAULT_LOCALE) {
  return passwordResetEmailCopy[locale] ?? passwordResetEmailCopy[DEFAULT_LOCALE];
}

function buildEmailText(resetUrl: string, locale?: SupportedLocale) {
  const copy = readEmailCopy(locale);

  return [
    copy.subject,
    "",
    copy.intro,
    resetUrl,
    "",
    copy.ignore,
  ].join("\n");
}

function buildEmailHtml({
  locale,
  resetUrl,
  userName,
}: {
  locale?: SupportedLocale;
  resetUrl: string;
  userName?: string | null;
}) {
  const copy = readEmailCopy(locale);
  const greeting = userName?.trim()
    ? copy.greetingNamed(escapeHtml(userName.trim()))
    : copy.greeting;
  const escapedUrl = escapeHtml(resetUrl);

  return [
    "<div>",
    `<p>${greeting}</p>`,
    `<p>${copy.intro}</p>`,
    `<p><a href="${escapedUrl}">${copy.button}</a></p>`,
    `<p>${copy.fallback} ${escapedUrl}</p>`,
    `<p>${copy.ignore}</p>`,
    "</div>",
  ].join("");
}

export function isPasswordResetEmailConfigured(
  env: NodeJS.ProcessEnv = process.env,
) {
  return Boolean(
    readEnvValue(env, "RESEND_API_KEY") &&
      readEnvValue(env, "PASSWORD_RESET_EMAIL_FROM"),
  );
}

export async function sendPasswordResetEmail({
  env = process.env,
  fetcher = fetch,
  locale = DEFAULT_LOCALE,
  resetUrl,
  to,
  userName,
}: PasswordResetEmailOptions): Promise<PasswordResetEmailResult> {
  const apiKey = readEnvValue(env, "RESEND_API_KEY");
  const from = readEnvValue(env, "PASSWORD_RESET_EMAIL_FROM");

  if (!apiKey || !from) {
    return {
      sent: false,
      skippedReason: "not_configured",
    };
  }

  const response = await fetcher(RESEND_EMAIL_API_URL, {
    body: JSON.stringify({
      from,
      html: buildEmailHtml({ locale, resetUrl, userName }),
      subject: readEmailCopy(locale).subject,
      text: buildEmailText(resetUrl, locale),
      to,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Password reset email delivery failed.");
  }

  return {
    sent: true,
  };
}
