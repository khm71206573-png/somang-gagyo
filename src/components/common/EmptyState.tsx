import Link from "next/link";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ message, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background px-margin-main text-center">
      <p className="text-body-md text-muted-foreground">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="rounded-md bg-primary px-4 py-2 text-label-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
