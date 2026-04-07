import type { HTMLMotionProps } from "framer-motion";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type Variant = "error" | "success" | "neutral" | "muted";

type Props = {
  variant: Variant;
} & Omit<HTMLMotionProps<"button">, "children"> & {
  children?: ReactNode;
};

export function Button(props: Props) {
  const { className, variant, disabled, children, ...restProps } = props;

  return (
    <motion.button
      {...restProps}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      className={cn(
        "flex w-full cursor-pointer justify-center items-center font-bold text-base leading-6 p-4 rounded-game select-none disabled:cursor-not-allowed disabled:opacity-50",
        {
          "border-0 bg-error text-white": variant === "error",
          "border-0 bg-success text-white": variant === "success",
          "border-0 bg-text text-white hover:bg-text/90": variant === "neutral",
          "border border-text/15 bg-card text-text shadow-sm hover:border-success/40":
            variant === "muted",
        },
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
