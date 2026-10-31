import { useState } from "react";
import { cn } from "../lib/cn";

type Props = {
  src: string;
  className?: string;
};

/** Image that fades in once loaded; the parent keeps the box size so layout never jumps */
export function FadeImage({ src, className }: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onLoad={() => setLoaded(true)}
      className={cn(
        "h-full w-full object-cover transition-opacity duration-300",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}
