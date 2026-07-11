"use client";

import { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

const S = {
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "var(--bg-secondary)",
  },
  messageList: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  message: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    fontSize: "0.85rem",
  },
  sender: {
    fontWeight: 600,
    color: "var(--accent-primary)",
    fontSize: "0.75rem",
  },
  bubble: {
    backgroundColor: "var(--bg-primary)",
    padding: "8px 12px",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-color)",
    wordBreak: "break-word",
  },
  inputArea: {
    padding: "12px",
    borderTop: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-secondary)",
    display: "flex",
    gap: 8,
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-primary)",
    fontSize: "0.9rem",
    outline: "none",
  },
  sendBtn: {
    padding: "8px 16px",
    backgroundColor: "var(--accent-primary)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default function RoomChat({ roomId, onContentChange }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const messagesRef = collection(db, "rooms", roomId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(data);
    });

    return unsubscribe;
  }, [roomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    const msg = newMessage;
    setNewMessage("");

    try {
      await addDoc(collection(db, "rooms", roomId, "messages"), {
        text: msg,
        senderName: auth.currentUser.displayName || "Anonymous",
        senderUid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      onContentChange?.();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div style={S.chatContainer}>
      <div style={S.messageList} ref={scrollRef}>
        {messages.map((message) => (
          <div key={message.id} style={S.message}>
            <span style={S.sender}>{message.senderName}</span>
            <div style={S.bubble}>{message.text}</div>
          </div>
        ))}
      </div>
      <form style={S.inputArea} onSubmit={handleSend} role="search" aria-label="Send chat message">
        <input
          style={S.input}
          placeholder="Message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          aria-label="Type a message"
        />
        <button type="submit" style={S.sendBtn} aria-label="Send message">Send</button>
      </form>
    </div>
  );
}
