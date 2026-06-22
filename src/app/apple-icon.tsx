import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 36,
          background: "linear-gradient(135deg, #ef4444 0%, #2563eb 100%)",
        }}
      >
        <svg
          width="110"
          height="110"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.8" />
          <ellipse cx="12" cy="12" rx="4" ry="9" stroke="white" strokeWidth="1.2" />
          <line x1="3" y1="12" x2="21" y2="12" stroke="white" strokeWidth="1.2" />
          <line x1="12" y1="3" x2="12" y2="21" stroke="white" strokeWidth="1.2" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
