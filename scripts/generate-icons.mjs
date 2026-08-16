import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "icons");

const BRAND_COLOR = "#914723";
const CROSS_COLOR = "#ffffff";

function el(type, props, children) {
  return { type, props: { ...props, children } };
}

function crossIcon({ size, radius, crossRatio }) {
  const barThickness = size * crossRatio * 0.42;
  const barLength = size * crossRatio;

  return el(
    "div",
    {
      style: {
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: BRAND_COLOR,
        borderRadius: radius,
      },
    },
    el(
      "div",
      {
        style: {
          position: "relative",
          width: barLength,
          height: barLength,
          display: "flex",
        },
      },
      [
        el("div", {
          style: {
            position: "absolute",
            left: (barLength - barThickness) / 2,
            top: 0,
            width: barThickness,
            height: barLength,
            backgroundColor: CROSS_COLOR,
            borderRadius: barThickness / 2,
          },
        }),
        el("div", {
          style: {
            position: "absolute",
            top: (barLength - barThickness) / 2,
            left: 0,
            width: barLength,
            height: barThickness,
            backgroundColor: CROSS_COLOR,
            borderRadius: barThickness / 2,
          },
        }),
      ],
    ),
  );
}

async function renderPng(jsx, size, fileName) {
  const response = new ImageResponse(jsx, { width: size, height: size });
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(path.join(OUT_DIR, fileName), buffer);
  console.log(`generated ${fileName}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  await renderPng(
    crossIcon({ size: 192, radius: 40, crossRatio: 0.55 }),
    192,
    "icon-192.png",
  );
  await renderPng(
    crossIcon({ size: 512, radius: 108, crossRatio: 0.55 }),
    512,
    "icon-512.png",
  );
  // 마스커블 아이콘: OS가 도형으로 잘라내므로 배경은 모서리까지 꽉 채우고
  // 실제 도형은 안전 영역(중앙 80%) 안쪽으로 작게 그린다.
  await renderPng(
    crossIcon({ size: 512, radius: 0, crossRatio: 0.4 }),
    512,
    "icon-maskable-512.png",
  );
  await renderPng(
    crossIcon({ size: 180, radius: 0, crossRatio: 0.55 }),
    180,
    "apple-icon-180.png",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
