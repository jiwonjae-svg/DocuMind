"use client";

import type {
  EnabledOAuthProvider,
  OAuthProviderId,
} from "@/lib/auth/oauth-providers";
import { Icon, type IconName, ui } from "@/components/ui";
import { signIn } from "next-auth/react";
import { useState } from "react";

type OAuthButtonsProps = {
  callbackUrl: string;
  copy?: {
    continueWith: string;
    opening: string;
    separator: string;
  };
  providers: EnabledOAuthProvider[];
};

const providerIcons: Record<OAuthProviderId, IconName> = {
  github: "github",
  google: "google",
};

function formatProviderCopy(template: string, providerName: string) {
  return template.replace("{provider}", providerName);
}

export function OAuthButtons({
  callbackUrl,
  copy = {
    continueWith: "Continue with {provider}",
    opening: "Opening {provider}...",
    separator: "or",
  },
  providers,
}: OAuthButtonsProps) {
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);

  if (providers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            type="button"
            disabled={pendingProvider !== null}
            onClick={() => {
              setPendingProvider(provider.id);
              void signIn(provider.id, { redirectTo: callbackUrl });
            }}
            className={`${ui.secondaryButton} w-full disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <Icon name={providerIcons[provider.id]} className="h-4 w-4" />
            {pendingProvider === provider.id
              ? formatProviderCopy(copy.opening, provider.name)
              : formatProviderCopy(copy.continueWith, provider.name)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          {copy.separator}
        </span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}
