import type { SupportedLocale } from "../i18n/config";
import { DEFAULT_LOCALE } from "../i18n/config";
import { RESEND_EMAIL_API_URL } from "./password-reset-email";

export const TEAM_INVITATION_EMAIL_SUBJECT = "Join a DocuMind team";

const teamInvitationEmailCopy: Record<
  SupportedLocale,
  {
    button: string;
    fallback: string;
    greeting: string;
    intro: (organizationName: string, teamName: string) => string;
    ignore: string;
    subject: string;
  }
> = {
  en: {
    button: "Accept invitation",
    fallback: "If the button does not work, open this URL:",
    greeting: "Hi,",
    ignore: "If you did not expect this invitation, you can ignore this email.",
    intro: (organizationName, teamName) =>
      `You have been invited to join ${organizationName} / ${teamName} in DocuMind. The invitation link expires soon and can be used once.`,
    subject: TEAM_INVITATION_EMAIL_SUBJECT,
  },
  ja: {
    button: "招待を承認",
    fallback: "ボタンが動作しない場合は、このURLを開いてください:",
    greeting: "こんにちは。",
    ignore: "この招待に心当たりがない場合は、このメールを無視してください。",
    intro: (organizationName, teamName) =>
      `DocuMindの${organizationName} / ${teamName}に招待されました。招待リンクはまもなく期限切れになり、一度だけ使用できます。`,
    subject: "DocuMindチームへの招待",
  },
  ko: {
    button: "초대 수락",
    fallback: "버튼이 작동하지 않으면 이 URL을 여세요:",
    greeting: "안녕하세요.",
    ignore: "이 초대를 예상하지 않았다면 이 이메일을 무시하셔도 됩니다.",
    intro: (organizationName, teamName) =>
      `DocuMind의 ${organizationName} / ${teamName} 팀에 초대되었습니다. 초대 링크는 곧 만료되며 한 번만 사용할 수 있습니다.`,
    subject: "DocuMind 팀 초대",
  },
};

type TeamInvitationEmailOptions = {
  env?: NodeJS.ProcessEnv;
  fetcher?: typeof fetch;
  inviteUrl: string;
  locale?: SupportedLocale;
  organizationName: string;
  teamName: string;
  to: string;
};

type TeamInvitationEmailResult =
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

function readFromAddress(env: NodeJS.ProcessEnv) {
  return (
    readEnvValue(env, "TEAM_INVITATION_EMAIL_FROM") ??
    readEnvValue(env, "PASSWORD_RESET_EMAIL_FROM")
  );
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
  return teamInvitationEmailCopy[locale] ?? teamInvitationEmailCopy[DEFAULT_LOCALE];
}

function buildEmailText({
  inviteUrl,
  locale,
  organizationName,
  teamName,
}: {
  inviteUrl: string;
  locale?: SupportedLocale;
  organizationName: string;
  teamName: string;
}) {
  const copy = readEmailCopy(locale);

  return [
    copy.subject,
    "",
    copy.intro(organizationName, teamName),
    inviteUrl,
    "",
    copy.ignore,
  ].join("\n");
}

function buildEmailHtml({
  inviteUrl,
  locale,
  organizationName,
  teamName,
}: {
  inviteUrl: string;
  locale?: SupportedLocale;
  organizationName: string;
  teamName: string;
}) {
  const copy = readEmailCopy(locale);
  const escapedInviteUrl = escapeHtml(inviteUrl);
  const escapedOrganizationName = escapeHtml(organizationName);
  const escapedTeamName = escapeHtml(teamName);

  return [
    "<div>",
    `<p>${copy.greeting}</p>`,
    `<p>${copy.intro(escapedOrganizationName, escapedTeamName)}</p>`,
    `<p><a href="${escapedInviteUrl}">${copy.button}</a></p>`,
    `<p>${copy.fallback} ${escapedInviteUrl}</p>`,
    `<p>${copy.ignore}</p>`,
    "</div>",
  ].join("");
}

export function isTeamInvitationEmailConfigured(
  env: NodeJS.ProcessEnv = process.env,
) {
  return Boolean(readEnvValue(env, "RESEND_API_KEY") && readFromAddress(env));
}

export async function sendTeamInvitationEmail({
  env = process.env,
  fetcher = fetch,
  inviteUrl,
  locale = DEFAULT_LOCALE,
  organizationName,
  teamName,
  to,
}: TeamInvitationEmailOptions): Promise<TeamInvitationEmailResult> {
  const apiKey = readEnvValue(env, "RESEND_API_KEY");
  const from = readFromAddress(env);

  if (!apiKey || !from) {
    return {
      sent: false,
      skippedReason: "not_configured",
    };
  }

  const response = await fetcher(RESEND_EMAIL_API_URL, {
    body: JSON.stringify({
      from,
      html: buildEmailHtml({
        inviteUrl,
        locale,
        organizationName,
        teamName,
      }),
      subject: readEmailCopy(locale).subject,
      text: buildEmailText({
        inviteUrl,
        locale,
        organizationName,
        teamName,
      }),
      to,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Team invitation email delivery failed.");
  }

  return {
    sent: true,
  };
}
