"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, ImageUp, Loader2, RotateCw, X } from "lucide-react";

interface DevotionPhotoPickerProps {
  /** 한 편이 두 페이지라 보통 2장을 함께 쓴다. */
  maxPhotos: number;
  isReading: boolean;
  /** 사진이 늘어날 때마다 그때까지 고른 사진 전체로 다시 읽는다. */
  onRead: (files: File[]) => void;
}

export function DevotionPhotoPicker({
  maxPhotos,
  isReading,
  onRead,
}: DevotionPhotoPickerProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)),
    [previews],
  );

  const isFull = files.length >= maxPhotos;

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    // 같은 사진을 다시 고를 수 있게 값을 비운다.
    event.target.value = "";
    if (picked.length === 0) return;

    const next = [...files, ...picked].slice(0, maxPhotos);
    setFiles(next);

    // 한 편이 두 페이지라, 두 번째 장을 더하면 두 장을 합쳐 다시 읽어야
    // 뒷면의 해설과 기도까지 채워진다. 그래서 지금까지 고른 전체를 넘긴다.
    onRead(next);
  }

  function handleRemove(target: File) {
    // 지우기만 하고 다시 읽지는 않는다. 필요하면 아래 "다시 읽기"를 누른다.
    setFiles((current) => current.filter((file) => file !== target));
  }

  return (
    <section className="mb-stack-md flex flex-col gap-stack-sm rounded-md border border-outline-variant/40 bg-surface-container-low p-4">
      <div>
        <h2 className="text-body-lg font-medium text-foreground">
          책 사진으로 등록하기
        </h2>
        <p className="mt-1 text-label-sm text-muted-foreground">
          사진을 고르면 바로 읽어서 아래 칸을 채워요. 펼침면을 한 장에 담지 말고
          페이지마다 한 장씩, 그늘 없이 평평하게 찍어주세요. 두 장을 한 번에
          고르면 한 번에 읽습니다.
        </p>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isReading || isFull}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-dashed border-outline-variant p-4 text-label-sm font-medium text-primary transition-colors hover:bg-surface-container disabled:opacity-50"
        >
          <Camera className="h-4 w-4" />
          사진 촬영
        </button>
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={isReading || isFull}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border border-dashed border-outline-variant p-4 text-label-sm font-medium text-primary transition-colors hover:bg-surface-container disabled:opacity-50"
        >
          <ImageUp className="h-4 w-4" />
          불러오기
        </button>
      </div>

      {isFull && (
        <p className="text-label-sm text-muted-foreground">
          사진은 {maxPhotos}장까지 쓸 수 있어요. 바꾸려면 아래에서 하나를 빼주세요.
        </p>
      )}

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
                onClick={() => handleRemove(preview.file)}
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/70 text-background transition-opacity active:opacity-80 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {isReading && (
        <p className="flex items-center justify-center gap-2 rounded-md bg-surface-container px-4 py-3 text-label-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          사진을 읽는 중이에요. 20초쯤 걸려요.
        </p>
      )}

      {!isReading && files.length > 0 && (
        <button
          type="button"
          onClick={() => onRead(files)}
          className="flex items-center justify-center gap-2 self-center text-label-sm font-medium text-primary"
        >
          <RotateCw className="h-3.5 w-3.5" />
          다시 읽기
        </button>
      )}
    </section>
  );
}
