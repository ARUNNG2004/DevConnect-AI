"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../context/AuthContext";
import RoomSummaryButton from "../../../components/rooms/RoomSummaryButton";
import RoomMembers from "../../../components/rooms/RoomMembers";
import RoomChat from "../../../components/rooms/RoomChat";
import RoomNotes from "../../../components/rooms/RoomNotes";
import RoomEditor from "../../../components/rooms/RoomEditor";
import RoomCursorLayer from "../../../components/rooms/RoomCursorLayer";
import RoomCallControls from "../../../components/rooms/RoomCallControls";
import ProtectedRoute from "../../../components/ProtectedRoute";
import RoomSummaryModal from "../../../components/rooms/RoomSummaryModal";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { heartbeatPresence } from "../../../lib/rooms";

const LANG_COLORS = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#377ab",
  Java: "#ed8b00",
  "C++": "#00599c",
  Go: "#00add8",
  Rust: "#dea584",
  React: "#61dafb",
  "Node.js": "#339933",
  Other: "#888",
};

/* ─── Local camera preview (renders in the header) ─── */

/* ─── Camera/mic status indicator (in the header — full preview is floating) ─── */

function HeaderCameraPreview({ stream, videoEnabled }) {
  const videoRef = useRef(null);
  const hasStream = !!stream;
  const hasVideo = hasStream && stream.getVideoTracks().length > 0 && videoEnabled;

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !stream || !videoEnabled) {
      if (el) el.srcObject = null;
      return;
    }
    el.srcObject = stream;
    el.play().catch(() => {});
  }, [stream, videoEnabled]);

  if (!hasStream) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginLeft: 8,
        flexShrink: 0,
      }}
    >
      {hasVideo && (
        <div
          style={{
            width: 48,
            height: 36,
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
            border: "1.5px solid var(--border-color)",
            backgroundColor: "#000",
            flexShrink: 0,
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Drag handle between panels ─── */

function DragHandle({ onDragStart }) {
  return (
    <div
      onMouseDown={onDragStart}
      style={{
        width: 6,
        cursor: "col-resize",
        backgroundColor: "transparent",
        flexShrink: 0,
        position: "relative",
        zIndex: 10,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--accent-primary)";
        e.currentTarget.style.opacity = "0.5";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.opacity = "1";
      }}
    />
  );
}

/* ─── Styles ─── */

const S = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "var(--bg-primary)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
    borderBottom: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-secondary)",
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    border: "none",
    borderRadius: "var(--radius-md)",
    backgroundColor: "transparent",
    color: "var(--text-secondary)",
    cursor: "pointer",
    fontSize: "1.1rem",
    flexShrink: 0,
  },
  roomTitle: {
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  langBadge: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.7rem",
    fontWeight: 600,
    flexShrink: 0,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  body: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },
  panel: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderBottom: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-secondary)",
    flexShrink: 0,
  },
  panelTitle: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    margin: 0,
  },
};

export default function RoomWorkspacePage() {
  const { roomId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [room, setRoom] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [summary, setSummary] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [hasSummary, setHasSummary] = useState(false);
  const hasSummaryRef = useRef(false);
  const presenceInterval = useRef(null);

  // Reset summary when workspace content changes
  const handleContentChange = useCallback(() => {
    if (hasSummaryRef.current) {
      hasSummaryRef.current = false;
      setHasSummary(false);
    }
  }, []);

  const [localStream, setLocalStream] = useState(null);
  const [panelFlex, setPanelFlex] = useState([1, 2, 1]);
  const dragState = useRef(null);
  const bodyRef = useRef(null);

  // Subscribe to room document
  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, "rooms", roomId), (snap) => {
      if (snap.exists()) {
        setRoom({ id: snap.id, ...snap.data() });
        setNotFound(false);
      } else {
        setRoom(null);
        setNotFound(true);
      }
    }, (err) => {
      console.error("Room subscription error:", err);
    });
    return () => unsub();
  }, [roomId]);

  // Generate summary handler
  const handleSummaryGenerated = useCallback((generatedSummary) => {
    setSummary(generatedSummary);
    setIsGeneratingSummary(false);
    hasSummaryRef.current = true;
    setHasSummary(true);
    setShowSummaryModal(true);
  }, []);

  const generateSummary = async () => {
    if (!user) {
      toast.error("You must be logged in to generate room summaries");
      return;
    }

    setIsGeneratingSummary(true);
    setShowSummaryHistory(false);

    try {
      const response = await fetch(`/api/rooms/${roomId}/summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate summary");
      }

      const data = await response.json();
      setSummary(data.summary);
      hasSummaryRef.current = true;
      setHasSummary(true);
      setShowSummaryModal(true);
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error(error.message || "Failed to generate summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Heartbeat presence
  useEffect(() => {
    if (!user || !roomId) return;
    heartbeatPresence(roomId, user);
    presenceInterval.current = setInterval(() => {
      heartbeatPresence(roomId, user);
    }, 30000);
    return () => { clearInterval(presenceInterval.current); };
  }, [user, roomId]);

  // Panel resize logic
  const handlePanelDragStart = useCallback((index, e) => {
    e.preventDefault();
    const bodyEl = bodyRef.current;
    if (!bodyEl) return;
    const bodyWidth = bodyEl.getBoundingClientRect().width;
    const totalFlex = panelFlex[0] + panelFlex[1] + panelFlex[2];
    dragState.current = {
      index,
      startX: e.clientX,
      startFlex: [...panelFlex],
      bodyWidth,
      totalFlex,
    };
    const onMove = (ev) => {
      const d = dragState.current;
      if (!d) return;
      const dx = ev.clientX - d.startX;
      const dFlex = (dx / d.bodyWidth) * d.totalFlex;
      const newFlex = [...d.startFlex];
      newFlex[d.index] = Math.max(0.3, d.startFlex[d.index] + dFlex);
      newFlex[d.index + 1] = Math.max(0.3, d.startFlex[d.index + 1] - dFlex);
      setPanelFlex(newFlex);
    };
    const onUp = () => {
      dragState.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [panelFlex]);

  if (authLoading || (!room && !notFound)) {
    return (
      <ProtectedRoute>
        <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading room...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (notFound) {
    return (
      <ProtectedRoute>
        <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "2rem", marginBottom: 8 }}>🔍</p>
            <p style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Room not found</p>
            <button
              style={{ ...S.backBtn, width: "auto", height: "auto", marginTop: 12, fontSize: "0.85rem", fontWeight: 500 }}
              onClick={() => router.push("/rooms")}
            >
              ← Back to rooms
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const langColor = LANG_COLORS[room?.language] || "#888";

  return (
    <ProtectedRoute>
      <div style={S.page}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.headerLeft}>
            <button style={S.backBtn} onClick={() => router.push("/rooms")} title="Back to rooms">
              ←
            </button>
            <h1 style={S.roomTitle}>{room?.title}</h1>
            <span
              style={{
                ...S.langBadge,
                backgroundColor: `${langColor}22`,
                color: langColor,
              }}
            >
              {room?.language}
            </span>
            <HeaderCameraPreview stream={localStream} videoEnabled={true} />
          </div>
          <div style={S.headerRight}>
            <button
              style={{ ...S.backBtn, width: "auto", padding: "0 12px", fontSize: "0.8rem", gap: 6 }}
              onClick={() => router.push("/dashboard")}
              title="Back to dashboard"
            >
              ← Dashboard
            </button>
            <RoomSummaryButton
              roomId={roomId}
              roomTitle={room?.title}
              onSummaryGenerated={handleSummaryGenerated}
              hasSummary={hasSummary}
              onViewSummary={() => setShowSummaryModal(true)}
            />
            <RoomMembers roomId={roomId} currentUser={user} />
          </div>
        </div>

        {/* Summary modal */}
        <RoomSummaryModal
          summary={showSummaryModal ? summary : null}
          onClose={() => setShowSummaryModal(false)}
        />

        {/* Body: 3-panel layout */}
        <div ref={bodyRef} style={S.body}>
          {/* Left: Chat */}
          <div style={{ ...S.panel, flex: panelFlex[0], borderRight: "1px solid var(--border-color)" }}>
            <div style={S.panelHeader}>
              <span style={{ fontSize: "0.9rem" }}>💬</span>
              <p style={S.panelTitle}>Chat</p>
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <RoomChat roomId={roomId} onContentChange={handleContentChange} />
            </div>
          </div>

          <DragHandle onDragStart={(e) => handlePanelDragStart(0, e)} />

          {/* Center: Code Editor */}
          <div style={{ ...S.panel, flex: panelFlex[1], position: "relative" }}>
            <RoomEditor roomId={roomId} onContentChange={handleContentChange} />
            <RoomCursorLayer roomId={roomId} currentUid={user?.uid} />
          </div>

          <DragHandle onDragStart={(e) => handlePanelDragStart(1, e)} />

          {/* Right: Notes */}
          <div style={{ ...S.panel, flex: panelFlex[2], borderLeft: "1px solid var(--border-color)" }}>
            <div style={S.panelHeader}>
              <span style={{ fontSize: "0.9rem" }}>📝</span>
              <p style={S.panelTitle}>Notes</p>
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <RoomNotes roomId={roomId} onContentChange={handleContentChange} />
            </div>
          </div>
        </div>

        {/* Bottom controls bar */}
        <RoomCallControls roomId={roomId} onLocalStream={setLocalStream} />
      </div>
    </ProtectedRoute>
  );
}