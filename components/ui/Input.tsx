"use client";

import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({ label, ...props }: Props) {
  return (
    <div className="input-wrapper">
      {label && <label className="input-label">{label}</label>}

      <input className="input" {...props} />
    </div>
  );
}