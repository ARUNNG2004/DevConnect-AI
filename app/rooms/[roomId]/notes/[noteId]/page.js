"use client";

import { useParams } from "next/navigation";

export default function NotePage() {
  const { roomId, noteId } = useParams();

  return (
    <div style={{ padding: 24 }}>
      <h2>Note {noteId} in room {roomId}</h2>
    </div>
  );
}
