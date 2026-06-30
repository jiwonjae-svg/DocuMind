"use client";

import { Icon, ui } from "@/components/ui";
import { useId, useState } from "react";

type DeleteDocumentFormProps = {
  action: string;
  cancelLabel: string;
  confirmLabel: string;
  deleteLabel: string;
  warning: string;
};

export function DeleteDocumentForm({
  action,
  cancelLabel,
  confirmLabel,
  deleteLabel,
  warning,
}: DeleteDocumentFormProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const warningId = useId();

  if (!isConfirming) {
    return (
      <button
        type="button"
        className={ui.dangerButton}
        onClick={() => setIsConfirming(true)}
      >
        <Icon name="trash" className="h-4 w-4" />
        {deleteLabel}
      </button>
    );
  }

  return (
    <div className="max-w-xs rounded-lg border border-red-200 bg-red-50 p-3">
      <p id={warningId} className="text-xs leading-5 text-red-800">
        {warning}
      </p>
      <form
        action={action}
        method="post"
        aria-describedby={warningId}
        className="mt-3 flex flex-wrap gap-2"
      >
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-[#10204b] transition hover:border-slate-400"
          onClick={() => setIsConfirming(false)}
        >
          {cancelLabel}
        </button>
        <button type="submit" className={ui.dangerButton}>
          <Icon name="trash" className="h-4 w-4" />
          {confirmLabel}
        </button>
      </form>
    </div>
  );
}
