import Image from "next/image";

interface CalendarTopBarProps {
  profileImageUrl: string;
}

export function CalendarTopBar({ profileImageUrl }: CalendarTopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex w-full items-center justify-between bg-background px-margin-main pt-stack-md pb-stack-sm">
      <h1 className="font-heading text-headline-md text-primary">일정</h1>
      <div className="h-10 w-10 overflow-hidden rounded-full bg-surface-container-highest">
        <Image
          src={profileImageUrl}
          alt="프로필"
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      </div>
    </header>
  );
}
