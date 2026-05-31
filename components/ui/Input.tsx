"use client";

import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  required?: boolean;
  error?: boolean;
};

export default function Input({
  label,
  required,
  error,
  className = "",
  ...props
}: Props) {
  return (
    <div className="input-wrapper">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}

      <input
        className={`input ${error ? "input-error" : ""} ${className}`}
        {...props}
      />
    </div>
  );
}