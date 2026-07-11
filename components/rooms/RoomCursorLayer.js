"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

const S = {
  overlay: {
    position: "absolute",
    top: 40,
    right: 8,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    zIndex: 10,
    pointerEvents: "none",
  },
  userBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 8px",
    borderRadius: "var(--radius-sm)",
    backgroundColor: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(4px)",
    fontSize: "0.68rem",
    color: "#fff",
    whiteSpace: "nowrap",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    flexShrink: 0,
  },
  name: {
    fontWeight: 600,
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 80,
  },
  line: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: 400,
  },
};

const CURSOR_COLORS = [
  "#f87171", "#fb923c", "#fbbf24", "#34d399",
  "#60a5fa", "#a78bfa", "#f472b6", "#38bdf8",
];

function getCursorColor(uid) {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = uid.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export default function RoomCursorLayer({ roomId, currentUid }) {
  const [cursors, setCursors] = useState([]);

  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(
      collection(db, "rooms", roomId, "presence"),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((u) => u.id !== currentUid && u.cursorLine != null);
        setCursors(list);
      }
    );
    return () => unsub();
  }, [roomId, currentUid]);

  if (cursors.length === 0) return null;

  return (
    <div style={S.overlay}>
      {cursors.map((c) => (
        <div key={c.id} style={S.userBadge}>
          <span style={{ ...S.dot, backgroundColor: getCursorColor(c.id) }} />
          <span style={S.name}>{c.displayName || "Anon"}</span>
          <span style={S.line}>Ln {c.cursorLine}</span>
        </div>
      ))}
    </div>
  );
}
