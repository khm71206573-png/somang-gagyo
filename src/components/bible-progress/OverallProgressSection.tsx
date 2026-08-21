import type { BookProgressCell, TestamentProgress } from "@/lib/mock-data";

interface OverallProgressSectionProps {
  oldTestament: TestamentProgress;
  newTestament: TestamentProgress;
}

function cellTitle(book: BookProgressCell) {
  const name = book.name ?? "";
  if (book.status === "completed") return `${name} 완독`;
  if (book.status === "reading") return `${name} ${book.readingPercent ?? 0}%`;
  return `${name} 읽기 전`;
}

function BookGrid({ books }: { books: BookProgressCell[] }) {
  return (
    <div className="grid grid-cols-8 gap-1">
      {books.map((book, index) => {
        if (book.status === "completed") {
          return (
            <div
              key={`${index}-${book.name}`}
              title={cellTitle(book)}
              className="aspect-square rounded-sm bg-secondary"
            />
          );
        }
        if (book.status === "reading") {
          return (
            <div
              key={`${index}-${book.name}`}
              title={cellTitle(book)}
              className="relative aspect-square overflow-hidden rounded-sm bg-secondary-fixed-dim"
            >
              <div
                className="absolute inset-y-0 left-0 bg-secondary"
                style={{ width: `${book.readingPercent ?? 0}%` }}
              />
            </div>
          );
        }
        return (
          <div
            key={`${index}-${book.name ?? "unread"}`}
            title={cellTitle(book)}
            className="aspect-square rounded-sm bg-surface-container-highest"
          />
        );
      })}
    </div>
  );
}

/** 통독 진행 중인 책 수 / 전체 책 수 라벨 */
function readCountLabel(books: BookProgressCell[]) {
  const completed = books.filter((book) => book.status === "completed").length;
  return `${completed}/${books.length}권`;
}

export function OverallProgressSection({
  oldTestament,
  newTestament,
}: OverallProgressSectionProps) {
  return (
    <section className="flex flex-col gap-stack-md pb-8">
      <h3 className="text-title-lg text-foreground">전체 진행</h3>
      <div className="flex flex-col gap-4 rounded-lg border border-surface-dim bg-surface-bright p-4 shadow-[0_4px_20px_-2px_rgba(44,44,44,0.04)]">
        <div>
          <h4 className="mb-2 flex items-center justify-between text-label-sm text-tertiary">
            <span>{oldTestament.label}</span>
            <span>{readCountLabel(oldTestament.books)}</span>
          </h4>
          <BookGrid books={oldTestament.books} />
        </div>
        <div className="mt-2">
          <h4 className="mb-2 flex items-center justify-between text-label-sm text-tertiary">
            <span>{newTestament.label}</span>
            <span>{readCountLabel(newTestament.books)}</span>
          </h4>
          <BookGrid books={newTestament.books} />
        </div>
      </div>
    </section>
  );
}
