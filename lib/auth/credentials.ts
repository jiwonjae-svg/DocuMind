export const MAX_EMAIL_CREDENTIAL_LENGTH = 254;
export const MAX_AUTH_DISPLAY_NAME_LENGTH = 80;
export const MAX_AUTH_IMAGE_URL_LENGTH = 2048;
export const MAX_PASSWORD_CREDENTIAL_LENGTH = 1024;

const unsafeAuthDisplayCharacters = /[\u0000-\u001f\u007f-\u009f\p{Cf}]+/gu;
const unsafeEmailCredentialCharacters =
  /[\u0000-\u001f\u007f-\u009f\p{Cf}]/u;

function readStringCredential(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeEmailCredential(value: unknown) {
  const email = readStringCredential(value).toLowerCase();

  if (
    !email ||
    email.length > MAX_EMAIL_CREDENTIAL_LENGTH ||
    unsafeEmailCredentialCharacters.test(email) ||
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

export function normalizeAuthDisplayName(value: unknown) {
  const name = readStringCredential(value)
    .normalize("NFC")
    .replace(unsafeAuthDisplayCharacters, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!name || name.length > MAX_AUTH_DISPLAY_NAME_LENGTH) {
    return null;
  }

  return name;
}

export function normalizeAuthImageUrl(value: unknown) {
  const imageUrl = readStringCredential(value).replace(
    unsafeAuthDisplayCharacters,
    "",
  );

  if (!imageUrl || imageUrl.length > MAX_AUTH_IMAGE_URL_LENGTH) {
    return null;
  }

  try {
    const url = new URL(imageUrl);

    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
