"use client";

/**
 * 책 사진을 그대로 올리면 두 가지가 걸린다.
 * - 아이폰 기본 촬영본은 HEIC라서 OCR이 읽지 못한다.
 * - 요즘 폰 사진은 한 장에 4~8MB라 여러 장이면 업로드가 막힌다.
 *
 * 그래서 보내기 전에 브라우저에서 긴 변 기준으로 줄이고 JPEG로 다시 굽는다.
 * 글자를 읽을 수 있을 만큼은 남겨야 해서 1600px 아래로는 줄이지 않는다.
 */

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.85;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("사진을 열지 못했어요."));
    };
    image.src = url;
  });
}

function toJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("사진을 변환하지 못했어요.")),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

/** 사진 한 장을 OCR로 보낼 수 있는 JPEG로 만든다. */
export async function prepareDevotionPhoto(file: File): Promise<File> {
  const image = await loadImage(file);

  const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("사진을 변환하지 못했어요.");
  }

  context.drawImage(image, 0, 0, width, height);
  const blob = await toJpegBlob(canvas);

  const baseName = file.name.replace(/\.[^.]+$/, "") || "qt";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}
