"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";

const S = {
  container: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  memberItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.85rem",
  },
  avatar: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "var(--accent-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "0.7rem",
    fontWeight: 600,
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "var(--accent-success)",
    boxShadow: "0 0 4px var(--accent-success)",
  },
  statusDotOffline: {
    backgroundColor: "var(--text-muted)",
    boxShadow: "none",
  },
};

export default function RoomMembers({ roomId, currentUser }) {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!roomId) return;

    const presenceRef = collection(db, "rooms", roomId, "presence");
    const q = query(presenceRef, orderBy("lastSeen", "desc")); // Sort by lastSeen

    const unsub = onSnapshot(q, (snap) => {
      const now = Date.now() / 1000; // Current timestamp in seconds
      const validThreshold = 30; // 30 seconds online threshold
      const list = snap.docs
        .filter(doc => {
          const data = doc.data();
          const lastSeen = data?.lastSeen?.seconds || 0;
          const isOnline = (now - lastSeen) <= validThreshold;
          const isCurrentUser = doc.id === currentUser?.uid;
          return isOnline && !isCurrentUser;
        })
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
      
      setMembers(list);
    });

    return unsub;
  }, [roomId, currentUser]);

  return (
    <div style={S.container}>
      <h3 style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
        Online Now ({members.length})
      </h3>
      {members.length === 0 && (
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
          No one else is online
        </p>
      )}
      {members.map(member => {
        const isOnline = () => {
          const lastSeen = member.lastSeen?.seconds || 0;
          return (Date.now() / 1000 - lastSeen) <= 30;
        };
        
        return (
          <div key={member.id} style={S.memberItem}>
            <div style={S.avatar}>
              {member.displayName?.charAt(0) || "?"}
            </div>
            <span style={{ color: "var(--text-primary)" }}>{member.displayName}</span>
            <span style={isOnline() ? S.statusDot : S.statusDotOffline} />
          </div>
        );
      })}
    </div>
  );
}
