"use client";

export default function UserAvatar({ photoURL, displayName, size = 36, fontSize = "0.9rem", onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size, height: size,
        borderRadius: "var(--radius-full)",
        background: "linear-gradient(135deg, #0284c7, #38bdf8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#000", fontWeight: 700, fontSize,
        border: "2px solid var(--border-color)",
        flexShrink: 0, overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
      }}
      title={onClick ? `View ${displayName || "user"}'s profile` : undefined}
    >
      {photoURL
        ? <img src={photoURL} alt={displayName || "Avatar"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : displayName?.charAt(0)?.toUpperCase() || "U"}
    </div>
  );
}