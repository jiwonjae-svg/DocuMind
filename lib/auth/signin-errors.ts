export type AuthPageErrorKind =
  | "accessDenied"
  | "accountNotLinked"
  | "callback"
  | "configuration"
  | "credentials"
  | "default"
  | "oauth"
  | "sessionRequired"
  | "verification";

type AuthErrorCopy = Record<
  | "signInErrorAccessDenied"
  | "signInErrorAccountNotLinked"
  | "signInErrorCallback"
  | "signInErrorConfiguration"
  | "signInErrorCredentials"
  | "signInErrorDefault"
  | "signInErrorOAuth"
  | "signInErrorSessionRequired"
  | "signInErrorVerification",
  string
>;

const MAX_AUTH_PAGE_ERROR_CODE_LENGTH = 64;
const safeAuthPageErrorCode = /^[A-Za-z][A-Za-z0-9]+$/;

const errorCodeKinds: Record<string, AuthPageErrorKind> = {
  AccessDenied: "accessDenied",
  Callback: "callback",
  Configuration: "configuration",
  CredentialsSignin: "credentials",
  Default: "default",
  OAuthAccountNotLinked: "accountNotLinked",
  OAuthCallback: "callback",
  OAuthCreateAccount: "oauth",
  OAuthSignin: "oauth",
  SessionRequired: "sessionRequired",
  Verification: "verification",
};

const errorCopyKeys: Record<AuthPageErrorKind, keyof AuthErrorCopy> = {
  accessDenied: "signInErrorAccessDenied",
  accountNotLinked: "signInErrorAccountNotLinked",
  callback: "signInErrorCallback",
  configuration: "signInErrorConfiguration",
  credentials: "signInErrorCredentials",
  default: "signInErrorDefault",
  oauth: "signInErrorOAuth",
  sessionRequired: "signInErrorSessionRequired",
  verification: "signInErrorVerification",
};

function readErrorCode(value: unknown) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (typeof rawValue !== "string") {
    return null;
  }

  const code = rawValue.trim();

  if (
    code.length === 0 ||
    code.length > MAX_AUTH_PAGE_ERROR_CODE_LENGTH ||
    !safeAuthPageErrorCode.test(code)
  ) {
    return null;
  }

  return code;
}

export function normalizeAuthPageErrorCode(value: unknown): AuthPageErrorKind | null {
  const code = readErrorCode(value);

  if (!code) {
    return null;
  }

  return errorCodeKinds[code] ?? "default";
}

export function getAuthPageErrorMessage(
  copy: AuthErrorCopy,
  kind: AuthPageErrorKind | null,
) {
  return kind ? copy[errorCopyKeys[kind]] : null;
}
