import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#05070E",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 16,
            fontWeight: 800,
            color: "#97c0ea",
            letterSpacing: "-1px",
          }}
        >
          Cx
        </span>
      </div>
    ),
    { ...size }
  );
}
