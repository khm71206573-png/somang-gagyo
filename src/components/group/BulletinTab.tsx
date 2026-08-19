interface BulletinTabProps {
  imageUrls: string[];
}

export function BulletinTab({ imageUrls }: BulletinTabProps) {
  if (imageUrls.length === 0) {
    return (
      <p className="py-stack-lg text-center text-body-md text-muted-foreground">
        등록된 주보가 아직 없어요.
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
          alt={`주보 ${index + 1}페이지`}
          className="w-full rounded-lg border border-outline-variant/40"
        />
      ))}
    </section>
  );
}
