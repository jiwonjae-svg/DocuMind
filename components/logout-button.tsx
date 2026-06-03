"use client";

import { Icon, ui } from "@/components/ui";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={`${ui.secondaryButton} h-10 px-3`}
    >
      <Icon name="lock" className="h-4 w-4 text-blue-700" />
      Sign out
    </button>
  );
}
