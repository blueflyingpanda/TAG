import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
};

export function Modal(props: Props) {
  const { children, className, footer } = props;

  return (
    <div className="flex flex-col items-center justify-center min-h-0 w-full px-4 py-4">
      <div
        className={cn(
          "w-full max-w-[310px] p-6 rounded-game bg-card shadow-sm",
          className,
        )}
      >
        {children}
      </div>
      {footer}
    </div>
  );
}
