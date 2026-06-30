import { getDocumentStorageProvider } from "../documents/storage";

export type ReadinessCheckId =
  | "authSecret"
  | "authUrl"
  | "database"
  | "emailDelivery"
  | "googleOAuth"
  | "openAi"
  | "storage";

export type ReadinessStatus = "missing" | "ready" | "warning";

export type ReadinessCheck = {
  id: ReadinessCheckId;
  message: ReadinessStatus;
  status: ReadinessStatus;
};

type ReadinessEnv = Record<string, string | undefined>;

const placeholderValues = new Set([
  "replace-with-a-strong-random-secret",
  "replace-with-openai-api-key",
]);

function hasConfiguredValue(value: string | undefined) {
  const normalized = value?.trim();

  return Boolean(normalized && !placeholderValues.has(normalized));
}

function buildCheck({
  id,
  ready,
  warning,
}: {
  id: ReadinessCheckId;
  ready: boolean;
  warning?: boolean;
}): ReadinessCheck {
  const status: ReadinessStatus = ready ? "ready" : warning ? "warning" : "missing";

  return {
    id,
    message: status,
    status,
  };
}

function buildStorageCheck(env: ReadinessEnv): ReadinessCheck {
  const provider = getDocumentStorageProvider(env);

  if (provider === "vercel-blob") {
    return buildCheck({
      id: "storage",
      ready: hasConfiguredValue(env.BLOB_READ_WRITE_TOKEN),
    });
  }

  return buildCheck({
    id: "storage",
    ready: false,
    warning: true,
  });
}

export function getDeploymentReadiness(env: ReadinessEnv = process.env) {
  const checks: ReadinessCheck[] = [
    buildCheck({
      id: "database",
      ready: hasConfiguredValue(env.DATABASE_URL),
    }),
    buildCheck({
      id: "authSecret",
      ready: hasConfiguredValue(env.AUTH_SECRET),
    }),
    buildCheck({
      id: "authUrl",
      ready: hasConfiguredValue(env.AUTH_URL),
      warning: true,
    }),
    buildCheck({
      id: "openAi",
      ready: hasConfiguredValue(env.OPENAI_API_KEY),
    }),
    buildStorageCheck(env),
    buildCheck({
      id: "googleOAuth",
      ready:
        hasConfiguredValue(env.AUTH_GOOGLE_ID) &&
        hasConfiguredValue(env.AUTH_GOOGLE_SECRET),
    }),
    buildCheck({
      id: "emailDelivery",
      ready:
        hasConfiguredValue(env.RESEND_API_KEY) &&
        hasConfiguredValue(env.PASSWORD_RESET_EMAIL_FROM),
    }),
  ];
  const readyCount = checks.filter((check) => check.status === "ready").length;
  const warningCount = checks.filter((check) => check.status === "warning").length;
  const missingCount = checks.filter((check) => check.status === "missing").length;
  const status: ReadinessStatus =
    missingCount > 0 ? "missing" : warningCount > 0 ? "warning" : "ready";

  return {
    checks,
    missingCount,
    readyCount,
    status,
    totalCount: checks.length,
    warningCount,
  };
}
