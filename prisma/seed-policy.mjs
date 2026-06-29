export const DEFAULT_SEED_USER_EMAIL = "seed@documind.local";
export const DEFAULT_SEED_USER_PASSWORD = "DocuMindSeed123!";
export const MAX_SEED_USER_EMAIL_LENGTH = 254;
export const MAX_SEED_USER_PASSWORD_LENGTH = 1024;
export const MIN_SEED_USER_PASSWORD_LENGTH = 12;

const unsafeSeedEmailCharacters = /[\u0000-\u001f\u007f-\u009f\p{Cf}]/u;

function normalizeSeedEmail(value) {
  const email = value.trim().toLowerCase();

  if (
    !email ||
    email.length > MAX_SEED_USER_EMAIL_LENGTH ||
    unsafeSeedEmailCharacters.test(email) ||
    /\s/.test(email)
  ) {
    throw new Error("SEED_USER_EMAIL must be a valid email address.");
  }

  const atIndex = email.indexOf("@");

  if (
    atIndex <= 0 ||
    atIndex !== email.lastIndexOf("@") ||
    atIndex === email.length - 1
  ) {
    throw new Error("SEED_USER_EMAIL must be a valid email address.");
  }

  return email;
}

function readSeedPassword(env) {
  return env.SEED_USER_PASSWORD || env.DEMO_USER_PASSWORD || DEFAULT_SEED_USER_PASSWORD;
}

export function readSeedCredentials(env = process.env) {
  const rawEmail =
    env.SEED_USER_EMAIL?.trim() ||
    env.DEMO_USER_EMAIL?.trim() ||
    DEFAULT_SEED_USER_EMAIL;
  const email = normalizeSeedEmail(rawEmail);
  const password = readSeedPassword(env);
  const isProduction = env.NODE_ENV === "production";

  if (
    isProduction &&
    (!env.SEED_USER_PASSWORD || env.SEED_USER_PASSWORD === DEFAULT_SEED_USER_PASSWORD)
  ) {
    throw new Error(
      "SEED_USER_PASSWORD must be explicitly set to a non-default value in production.",
    );
  }

  if (password.length < MIN_SEED_USER_PASSWORD_LENGTH) {
    throw new Error(
      `SEED_USER_PASSWORD must be at least ${MIN_SEED_USER_PASSWORD_LENGTH} characters.`,
    );
  }

  if (password.length > MAX_SEED_USER_PASSWORD_LENGTH) {
    throw new Error(
      `SEED_USER_PASSWORD must be ${MAX_SEED_USER_PASSWORD_LENGTH} characters or fewer.`,
    );
  }

  return {
    email,
    password,
  };
}

export const DEFAULT_DEMO_USER_EMAIL = DEFAULT_SEED_USER_EMAIL;
export const DEFAULT_DEMO_USER_PASSWORD = DEFAULT_SEED_USER_PASSWORD;
export const MIN_DEMO_USER_PASSWORD_LENGTH = MIN_SEED_USER_PASSWORD_LENGTH;
export const readDemoSeedCredentials = readSeedCredentials;
