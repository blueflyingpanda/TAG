type Props = {
  icon: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, message, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-12 text-center">
      <div className="text-5xl" aria-hidden>
        {icon}
      </div>
      <p className="max-w-md text-text/70">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-game bg-success px-6 py-2 font-semibold text-white transition hover:opacity-90"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
