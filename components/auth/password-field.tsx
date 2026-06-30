"use client";

import { Icon, ui } from "@/components/ui";
import { useId, useState } from "react";

type PasswordFieldProps = {
  autoComplete: string;
  hideLabel: string;
  help?: string;
  label: string;
  minLength?: number;
  name?: string;
  required?: boolean;
  showLabel: string;
};

export function PasswordField({
  autoComplete,
  hideLabel,
  help,
  label,
  minLength,
  name = "password",
  required = true,
  showLabel,
}: PasswordFieldProps) {
  const inputId = useId();
  const helpId = useId();
  const [isVisible, setIsVisible] = useState(false);
  const toggleLabel = isVisible ? hideLabel : showLabel;

  return (
    <div>
      <label htmlFor={inputId} className={ui.label}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={inputId}
          name={name}
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
          aria-describedby={help ? helpId : undefined}
          className={`${ui.input} pr-12`}
        />
        <button
          type="button"
          aria-label={toggleLabel}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((current) => !current)}
          className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <Icon
            name={isVisible ? "viewOff" : "view"}
            className="h-4 w-4"
          />
        </button>
      </div>
      {help ? (
        <p id={helpId} className="mt-2 text-xs leading-5 text-slate-500">
          {help}
        </p>
      ) : null}
    </div>
  );
}
