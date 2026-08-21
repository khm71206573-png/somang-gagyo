export function DashboardSkeleton() {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] animate-pulse bg-background pb-[100px]">
      <div className="flex w-full items-center justify-between px-margin-main pt-stack-md pb-stack-sm">
        <div className="space-y-2">
          <div className="h-3 w-32 rounded-full bg-surface-container-low" />
          <div className="h-6 w-40 rounded-full bg-surface-container-low" />
        </div>
        <div className="h-10 w-10 rounded-full bg-surface-container-low" />
      </div>
      <main className="space-y-stack-lg px-margin-main pt-stack-sm">
        <div className="h-12 w-full rounded-md bg-surface-container-low" />
        <div className="h-28 w-full rounded-md bg-surface-container-low" />
        <div className="h-32 w-full rounded-md bg-surface-container-low" />
        <div className="grid grid-cols-2 gap-gutter-card">
          <div className="h-40 w-full rounded-md bg-surface-container-low" />
          <div className="h-40 w-full rounded-md bg-surface-container-low" />
        </div>
        <div className="h-32 w-full rounded-md bg-surface-container-low" />
      </main>
    </div>
  );
}
