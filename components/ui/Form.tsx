"use client";

import { FormHTMLAttributes } from "react";

type Props = FormHTMLAttributes<HTMLFormElement>;

export default function Form(props: Props) {
  return <form className={`form ${props.className || ""}`} {...props} />;
}