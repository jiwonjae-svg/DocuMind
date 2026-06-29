export const DEFAULT_SEED_USER_EMAIL = "seed@documind.local";
export const DEFAULT_SEED_USER_PASSWORD = "DocuMindSeed123!";
export const MIN_SEED_USER_PASSWORD_LENGTH = 12;

function readSeedPassword(env) {
  return env.SEED_USER_PASSWORD || env.DEMO_USER_PASSWORD || DEFAULT_SEED_USER_PASSWORD;
}

export function readSeedCredentials(env = process.env) {
  const email =
    env.SEED_USER_EMAIL?.trim() ||
    env.DEMO_USER_EMAIL?.trim() ||
    DEFAULT_SEED_USER_EMAIL;
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

  return {
    email,
    password,
  };
}

export const DEFAULT_DEMO_USER_EMAIL = DEFAULT_SEED_USER_EMAIL;
export const DEFAULT_DEMO_USER_PASSWORD = DEFAULT_SEED_USER_PASSWORD;
export const MIN_DEMO_USER_PASSWORD_LENGTH = MIN_SEED_USER_PASSWORD_LENGTH;
export const readDemoSeedCredentials = readSeedCredentials;
