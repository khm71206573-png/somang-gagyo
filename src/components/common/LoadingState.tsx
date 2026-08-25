interface LoadingStateProps {
  /** 탭 안처럼 화면 일부에만 보여줄 때는 화면 전체 높이를 쓰지 않는다. */
  inline?: boolean;
}

export function LoadingState({ inline = false }: LoadingStateProps) {
  return (
    <div
      className={
        inline
          ? "flex w-full items-center justify-center py-stack-lg"
          : "flex min-h-screen w-full items-center justify-center bg-background"
      }
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
