interface SermonManuscriptTabProps {
  imageUrls: string[];
}

export function SermonManuscriptTab({ imageUrls }: SermonManuscriptTabProps) {
  if (imageUrls.length === 0) {
    return (
      <p className="py-stack-lg text-center text-body-md text-muted-foreground">
        등록된 설교안이 아직 없어요.
      </p>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      {imageUrls.map((url, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={url}
          src={url}
          alt={`설교안 ${index + 1}페이지`}
          className="w-full rounded-lg border border-outline-variant/40"
        />
      ))}
    </section>
  );
}
