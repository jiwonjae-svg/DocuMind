export const MAX_EMAIL_CREDENTIAL_LENGTH = 254;
export const MAX_PASSWORD_CREDENTIAL_LENGTH = 1024;

function readStringCredential(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeEmailCredential(value: unknown) {
  const email = readStringCredential(value).toLowerCase();

  if (
    !email ||
    email.length > MAX_EMAIL_CREDENTIAL_LENGTH ||
    /\s/.test(email)
  ) {
    return null;
  }

  const atIndex = email.indexOf("@");

  if (
    atIndex <= 0 ||
    atIndex !== email.lastIndexOf("@") ||
    atIndex === email.length - 1
  ) {
    return null;
  }

  return email;
}

export function normalizePasswordCredential(value: unknown) {
  const password = readStringCredential(value);

  if (!password || password.length > MAX_PASSWORD_CREDENTIAL_LENGTH) {
    return null;
  }

  return password;
}
