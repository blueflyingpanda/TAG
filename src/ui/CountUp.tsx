import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  durationMs?: number;
};

/** Counts from the last shown value to value; shows the final value at once when motion is reduced */
export function CountUp({ value, durationMs = 900 }: Props) {
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [shown, setShown] = useState(reduced ? value : 0);
  const shownRef = useRef(shown);

  useEffect(() => {
    if (reduced) return;
    const from = shownRef.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (value - from) * eased);
      shownRef.current = next;
      setShown(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs, reduced]);

  return <>{reduced ? value : shown}</>;
}
