import Image from "next/image";
import Link from "next/link";
import type { GreetingInfo } from "@/lib/mock-data";

interface GreetingHeaderProps {
  greeting: GreetingInfo;
}

export function GreetingHeader({ greeting }: GreetingHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex w-full flex-col items-start justify-between bg-background px-margin-main pt-stack-md pb-stack-sm">
      <div className="mb-1 flex w-full items-center justify-between">
        <div className="flex flex-col">
          <span className="mb-1 text-label-sm text-muted-foreground">
            {greeting.dateLabel}
          </span>
          <h1 className="font-heading text-headline-md-mobile tracking-tight text-primary">
            {greeting.userName}님, {greeting.greetingMessage}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            aria-label="내 프로필"
            className="block h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border transition-transform duration-150 active:scale-95"
          >
            <Image
              src={greeting.profileImageUrl}
              alt="프로필"
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
