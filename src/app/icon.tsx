import { ImageResponse } from "next/og";

// Next.js speciální soubor: appka díky němu automaticky dostane
// favicon i ikonu pro "Přidat na plochu" (PWA), aniž bychom museli
// ručně vyrábět a spravovat PNG soubory.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  // Emoji (☕) se v ImageResponse (Satori) spolehlivě nevykreslí bez
  // fetchování externího emoji fontu, což je pro ikonu appky zbytečná
  // závislost na síti — místo toho kreslíme šálek s podšálkem a
  // ouškem jako jednoduché SVG tvary.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#78350f",
        }}
      >
        <svg width="300" height="300" viewBox="0 0 100 100" fill="none">
          <ellipse cx="42" cy="78" rx="34" ry="7" fill="#fef3c7" />
          <path d="M14 34h56l-6 40a10 10 0 0 1-10 8H30a10 10 0 0 1-10-8L14 34z" fill="#fef3c7" />
          <path
            d="M70 40h6a12 12 0 0 1 0 24h-8"
            stroke="#fef3c7"
            strokeWidth="7"
            fill="none"
          />
          <path
            d="M26 12c-4 5 4 7 0 12M42 12c-4 5 4 7 0 12M58 12c-4 5 4 7 0 12"
            stroke="#fef3c7"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
