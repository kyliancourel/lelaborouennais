"use client";

import { HTMLMotionProps, motion } from "framer-motion";

type Variant = "primary" | "secondary" | "danger";

type Props = HTMLMotionProps<"button"> & {
  variant?: Variant;
};

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: Props) {
  const variantClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "secondary"
      ? "btn-outline"
      : "btn-danger";

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`btn ${variantClass} ${className}`}
      {...props}
    />
  );
}