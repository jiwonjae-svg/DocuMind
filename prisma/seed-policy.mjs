export const DEFAULT_DEMO_USER_EMAIL = "demo@documind.local";
export const DEFAULT_DEMO_USER_PASSWORD = "DocuMindDemo123!";
export const MIN_DEMO_USER_PASSWORD_LENGTH = 12;

export function readDemoSeedCredentials(env = process.env) {
  const email = env.DEMO_USER_EMAIL?.trim() || DEFAULT_DEMO_USER_EMAIL;
  const password = env.DEMO_USER_PASSWORD || DEFAULT_DEMO_USER_PASSWORD;
  const isProduction = env.NODE_ENV === "production";

  if (
    isProduction &&
    (!env.DEMO_USER_PASSWORD ||
      env.DEMO_USER_PASSWORD === DEFAULT_DEMO_USER_PASSWORD)
  ) {
    throw new Error(
      "DEMO_USER_PASSWORD must be explicitly set to a non-default value in production.",
    );
  }

  if (password.length < MIN_DEMO_USER_PASSWORD_LENGTH) {
    throw new Error(
      `DEMO_USER_PASSWORD must be at least ${MIN_DEMO_USER_PASSWORD_LENGTH} characters.`,
    );
  }

  return {
    email,
    password,
  };
}
