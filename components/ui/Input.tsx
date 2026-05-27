"use client";

import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: boolean;
};

export default function Input({ label, error, className = "", ...props }: Props) {
  return (
    <div className="input-wrapper">
      {label && <label className="input-label">{label}</label>}

      <input
        className={`input ${error ? "input-error" : ""} ${className}`}
        {...props}
      />
    </div>
  );
}