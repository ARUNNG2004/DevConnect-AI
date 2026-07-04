"use client";

import { useState, useEffect, useRef } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

const S = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "var(--bg-primary)",
    padding: "16px",
  },
  textarea: {
    flex: 1,
    width: "100%",
    padding: "12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-secondary)",
    color: "var(--text-primary)",
    fontFamily: "monospace",
    fontSize: "0.85rem",
    lineHeight: "1.5",
    resize: "none",
    outline: "none",
  },
  footer: {
    marginTop: "8px",
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    textAlign: "right",
  },
};

export default function RoomNotes({ roomId, onContentChange }) {
  const [content, setContent] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const userEditedRef = useRef(false);

  // Subscribe to room note
  useEffect(() => {
    if (!roomId) return;

    const unsub = onSnapshot(doc(db, "rooms", roomId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.noteContent !== undefined && data.noteContent !== content) {
          setContent(data.noteContent);
        }
      }
    });

    return unsub;
  }, [roomId]);

  // Debounced save
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!roomId || content === undefined) return;
      
      try {
        await setDoc(doc(db, "rooms", roomId), { noteContent: content }, { merge: true });
        setLastSaved(new Date());
        if (userEditedRef.current) {
          userEditedRef.current = false;
          onContentChange?.();
        }
      } catch (err) {
        console.error("Error saving note:", err);
      }
    }, 1000);

    return () => clearTimeout(handler);
  }, [content, roomId]);

  return (
    <div style={S.container} role="document" aria-label="Shared notes">
      <textarea
        style={S.textarea}
        placeholder="Shared notes..."
        value={content}
        onChange={(e) => { userEditedRef.current = true; setContent(e.target.value); }}
        aria-label="Edit shared notes"
      />
      <div style={S.footer}>
        {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : "Saving..."}
      </div>
    </div>
  );
}
