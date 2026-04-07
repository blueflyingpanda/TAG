import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../lib/cn";

type Props = {
  seconds: number;
  isWarning?: boolean;
  className?: string;
  suffix?: string;
};

/**
 * Digit flip without overlap (alias-main uses AnimatePresence without mode;
 * `mode="wait"` avoids ghosting when the previous digit uses position:absolute exit).
 */
export function Countdown({
  seconds,
  isWarning = false,
  className,
  suffix = "",
}: Props) {
  return (
    <div
      className={cn(
        "relative flex h-[1.15em] min-w-[4ch] items-center justify-center overflow-hidden text-3xl font-bold tabular-nums md:text-4xl",
        isWarning ? "text-error" : "text-text",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={seconds}
          className="flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.92, y: 6 }}
          animate={{ opacity: 1, scale: 1.08, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -6 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
        >
          {seconds}
          {suffix}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
