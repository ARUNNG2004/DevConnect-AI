"use client";

import { useParams } from "next/navigation";

export default function PresencePage() {
  const { roomId, uid } = useParams();

  return (
    <div style={{ padding: 24 }}>
      <h2>Presence for {uid} in room {roomId}</h2>
    </div>
  );
}
