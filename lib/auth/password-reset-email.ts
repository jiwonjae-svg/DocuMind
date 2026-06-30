export const RESEND_EMAIL_API_URL = "https://api.resend.com/emails";
export const PASSWORD_RESET_EMAIL_SUBJECT = "Reset your DocuMind password";

type PasswordResetEmailOptions = {
  env?: NodeJS.ProcessEnv;
  fetcher?: typeof fetch;
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

function buildEmailText(resetUrl: string) {
  return [
    "Reset your DocuMind password",
    "",
    "Use the link below to set a new password. The link expires soon and can be used once.",
    resetUrl,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");
}

function buildEmailHtml(resetUrl: string, userName?: string | null) {
  const greeting = userName?.trim()
    ? `Hi ${escapeHtml(userName.trim())},`
    : "Hi,";
  const escapedUrl = escapeHtml(resetUrl);

  return [
    "<div>",
    `<p>${greeting}</p>`,
    "<p>Use this link to reset your DocuMind password. The link expires soon and can be used once.</p>",
    `<p><a href="${escapedUrl}">Reset password</a></p>`,
    `<p>If the button does not work, open this URL: ${escapedUrl}</p>`,
    "<p>If you did not request this, you can ignore this email.</p>",
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
      html: buildEmailHtml(resetUrl, userName),
      subject: PASSWORD_RESET_EMAIL_SUBJECT,
      text: buildEmailText(resetUrl),
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
