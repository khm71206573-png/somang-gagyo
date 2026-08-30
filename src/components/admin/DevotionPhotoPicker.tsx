"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, ScanText, X } from "lucide-react";

interface DevotionPhotoPickerProps {
  /** 한 편이 두 페이지라 보통 2장을 함께 고른다. */
  maxPhotos: number;
  isReading: boolean;
  onRead: (files: File[]) => void;
}

export function DevotionPhotoPicker({
  maxPhotos,
  isReading,
  onRead,
}: DevotionPhotoPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)),
    [previews],
  );

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    // 같은 사진을 다시 고를 수 있게 값을 비운다.
    event.target.value = "";
    if (picked.length === 0) return;

    setFiles((current) => [...current, ...picked].slice(0, maxPhotos));
  }

  return (
    <section className="mb-stack-md flex flex-col gap-stack-sm rounded-md border border-outline-variant/40 bg-surface-container-low p-4">
      <div>
        <h2 className="text-body-lg font-medium text-foreground">
          책 사진으로 등록하기
        </h2>
        <p className="mt-1 text-label-sm text-muted-foreground">
          펼침면을 한 장에 담지 말고 페이지마다 한 장씩, 그늘 없이 평평하게
          찍어주세요. 읽어온 내용은 아래 입력칸에서 사진과 대조해 고칠 수 있어요.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isReading || files.length >= maxPhotos}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-outline-variant p-4 text-label-sm font-medium text-primary transition-colors hover:bg-surface-container-low disabled:opacity-50"
      >
        <Camera className="h-4 w-4" />
        {files.length >= maxPhotos
          ? `사진은 ${maxPhotos}장까지 고를 수 있어요`
          : "QT 지면 사진 고르기"}
      </button>

      {previews.length > 0 && (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {previews.map((preview) => (
            <li key={preview.url} className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.url}
                alt={preview.file.name}
                className="h-24 w-20 rounded-md border border-outline-variant/40 object-cover"
              />
              <button
                type="button"
                aria-label="고른 사진 빼기"
                disabled={isReading}
                onClick={() =>
                  setFiles((current) =>
                    current.filter((file) => file !== preview.file),
                  )
                }
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/70 text-background transition-opacity active:opacity-80 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => onRead(files)}
        disabled={isReading || files.length === 0}
        className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-label-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        <ScanText className="h-4 w-4" />
        {isReading ? "사진 읽는 중..." : "사진에서 읽어오기"}
      </button>
    </section>
  );
}
