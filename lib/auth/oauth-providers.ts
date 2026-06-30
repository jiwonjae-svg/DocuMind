export type OAuthProviderId = "github" | "google";

export type EnabledOAuthProvider = {
  id: OAuthProviderId;
  name: string;
};

const providerConfig = {
  github: {
    idEnv: "AUTH_GITHUB_ID",
    name: "GitHub",
    secretEnv: "AUTH_GITHUB_SECRET",
  },
  google: {
    idEnv: "AUTH_GOOGLE_ID",
    name: "Google",
    secretEnv: "AUTH_GOOGLE_SECRET",
  },
} as const satisfies Record<
  OAuthProviderId,
  { idEnv: string; name: string; secretEnv: string }
>;

function hasEnvValue(value: string | undefined) {
  return Boolean(value?.trim());
}

export function getEnabledOAuthProviders(
  env: NodeJS.ProcessEnv = process.env,
): EnabledOAuthProvider[] {
  return (Object.keys(providerConfig) as OAuthProviderId[])
    .filter((id) => {
      const config = providerConfig[id];

      return hasEnvValue(env[config.idEnv]) && hasEnvValue(env[config.secretEnv]);
    })
    .map((id) => ({
      id,
      name: providerConfig[id].name,
    }));
}

export function isOAuthProviderEnabled(
  id: OAuthProviderId,
  env: NodeJS.ProcessEnv = process.env,
) {
  return getEnabledOAuthProviders(env).some((provider) => provider.id === id);
}

export function normalizeOAuthProviderId(value: unknown): OAuthProviderId | null {
  return value === "github" || value === "google" ? value : null;
}

export function getOAuthProviderName(provider: string) {
  return providerConfig[provider as OAuthProviderId]?.name ?? provider;
}
