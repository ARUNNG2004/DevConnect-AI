"use client";

import { useParams } from "next/navigation";

export default function MessagePage() {
  const { roomId, messageId } = useParams();

  return (
    <div style={{ padding: 24 }}>
      <h2>Message {messageId} in room {roomId}</h2>
    </div>
  );
}
