import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../lib/cn";

type Props = {
  variant: "error" | "success";
  value: number;
  className?: string;
};

export function Counter({ variant, value, className }: Props) {
  return (
    <div
      className={cn(
        "relative h-[1em] overflow-hidden text-3xl font-semibold leading-none md:text-5xl",
        className,
      )}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={value}
          className={cn({
            "text-error": variant === "error",
            "text-success": variant === "success",
          })}
          exit={{ y: 75, opacity: 0, position: "absolute" }}
          animate={{ y: 0, opacity: 1 }}
          initial={{ y: -75, opacity: 0 }}
        >
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
