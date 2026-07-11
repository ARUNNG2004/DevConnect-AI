"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  PhoneOff,
  Phone,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Loader2,
  X,
  AlertTriangle,
  XCircle,
  UserMinus,
} from "lucide-react";
import {
  joinCall,
  leaveCall,
  toggleMicrophone,
  toggleCamera,
  startScreenShare,
  stopScreenShare,
  getLocalStream,
  getScreenStream,
  onCallEvent,
} from "../../lib/webrtc";

/* ─── Styles ─── */

const S = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "10px 14px",
    borderTop: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-secondary)",
    flexShrink: 0,
    position: "relative",
  },
  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-primary)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    fontSize: "1rem",
    transition: "background-color 0.15s, color 0.15s",
  },
  btnActive: {
    backgroundColor: "var(--accent-primary)",
    color: "#fff",
    border: "none",
  },
  btnDanger: {
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
  },
  btnJoin: {
    backgroundColor: "#22c55e",
    color: "#fff",
    border: "none",
  },
  statusBadge: {
    fontSize: "0.7rem",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "var(--radius-sm)",
    backgroundColor: "#22c55e22",
    color: "#22c55e",
    marginRight: 8,
  },
  statusBadgeConnecting: {
    backgroundColor: "#f59e0b22",
    color: "#f59e0b",
  },
  /* Floating panel (shared by self-view, remote video, screen share) */
  floatingPanel: {
    position: "fixed",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
    border: "2px solid var(--border-color)",
    backgroundColor: "#000",
    zIndex: 50,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
  },
  titleBar: {
    height: 28,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 8px",
    fontSize: "0.65rem",
    fontWeight: 600,
    color: "#fff",
    cursor: "move",
    userSelect: "none",
    flexShrink: 0,
  },
  titleBarLabel: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  video: {
    width: "100%",
    flex: 1,
    objectFit: "cover",
    display: "block",
    backgroundColor: "#111",
  },
  videoContain: {
    width: "100%",
    flex: 1,
    objectFit: "contain",
    display: "block",
    backgroundColor: "#111",
  },
  peerLabel: {
    position: "absolute",
    bottom: 4,
    left: 6,
    fontSize: "0.65rem",
    fontWeight: 600,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: "1px 6px",
    borderRadius: 4,
  },
  noVideoPlaceholder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    flex: 1,
    color: "var(--text-muted)",
    fontSize: "2rem",
  },
  smallBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    fontSize: "0.7rem",
    padding: "2px 4px",
    lineHeight: 1,
    borderRadius: 3,
    flexShrink: 0,
  },
  smallBtnDanger: {
    color: "#ef4444",
  },
  /* Toast styles */
  toastContainer: {
    position: "fixed",
    top: 16,
    right: 16,
    zIndex: 200,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    pointerEvents: "none",
  },
  toast: {
    pointerEvents: "auto",
    padding: "10px 16px",
    borderRadius: "var(--radius-md)",
    fontSize: "0.82rem",
    fontWeight: 500,
    color: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    maxWidth: 340,
  },
  toastInfo: { backgroundColor: "#3b82f6" },
  toastSuccess: { backgroundColor: "#22c55e" },
  toastWarning: { backgroundColor: "#f59e0b" },
  toastError: { backgroundColor: "#ef4444" },
};

/* ─── Toast system ─── */

let toastIdCounter = 0;

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div style={S.toastContainer}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            ...S.toast,
            ...(S[`toast${t.type}`] || S.toastInfo),
            animation: "toastSlideIn 0.3s ease-out",
          }}
          onClick={() => onDismiss(t.id)}
        >
          {t.icon && <span style={{ marginRight: 6 }}>{t.icon}</span>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ─── Pointer-based drag hook (works for mouse + touch) ─── */

function useDraggable(initialPos, { boundsRef } = {}) {
  const [pos, setPos] = useState(initialPos);
  const dragRef = useRef(null);

  // Clamp inside viewport
  const clamp = useCallback((x, y, w, h) => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    return {
      x: Math.max(0, Math.min(x, vw - w)),
      y: Math.max(0, Math.min(y, vh - h)),
    };
  }, []);

  const onPointerDown = useCallback((e) => {
    // Only drag from the handle (check dataset or parent)
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    dragRef.current = {
      sx: e.clientX,
      sy: e.clientY,
      sp: { ...pos },
    };
    const onMove = (ev) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = ev.clientX - d.sx;
      const dy = ev.clientY - d.sy;
      setPos({ x: d.sp.x + dx, y: d.sp.y + dy });
    };
    const onUp = () => {
      dragRef.current = null;
      target.releasePointerCapture(e.pointerId);
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
    };
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
  }, [pos]);

  return { pos, setPos, onPointerDown, clamp };
}

/* ─── Draggable Camera Preview (shows remote camera by default, or local) ─── */

function CameraPreview({ stream, label, mirrored, videoEnabled, micEnabled }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [pos, setPos] = useState({ x: 16, y: 16 });
  const dragRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    el.play().catch(() => {});
  }, [stream]);

  // Play remote audio through hidden <audio> element (video is muted to prevent echo)
  useEffect(() => {
    const aEl = audioRef.current;
    if (!aEl || !stream) return;
    aEl.srcObject = stream;
    aEl.play().catch(() => {});
  }, [stream]);

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { sx: e.clientX, sy: e.clientY, sp: { ...pos } };
    const onMove = (ev) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = ev.clientX - d.sx;
      const dy = ev.clientY - d.sy;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = 180;
      const h = 135;
      setPos({
        x: Math.max(0, Math.min(d.sp.x + dx, vw - w)),
        y: Math.max(0, Math.min(d.sp.y + dy, vh - h)),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      e.currentTarget.releasePointerCapture(e.pointerId);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, [pos]);

  if (!stream) return null;

  return (
    <div
      style={{
        ...S.floatingPanel,
        left: pos.x,
        top: pos.y,
        width: 180,
        height: 135,
      }}
    >
      <div
        style={S.titleBar}
        onPointerDown={onPointerDown}
      >
        <span style={S.titleBarLabel}>
          {micEnabled !== undefined ? (micEnabled ? <Mic size={10} /> : <MicOff size={10} />) : ""} {label || "Camera"}
        </span>
        <span style={{ opacity: 0.6 }}>{videoEnabled === false ? <><VideoOff size={10} /> off</> : ""}</span>
      </div>
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        {videoEnabled !== false ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              ...S.video,
              ...(mirrored ? { transform: "scaleX(-1)" } : {}),
            }}
          />
        ) : (
          <div style={S.noVideoPlaceholder}><VideoOff size={32} /></div>
        )}
        <span style={S.peerLabel}>{label || "Camera"}</span>
      </div>
      {/* Hidden audio element — plays remote audio (video is muted to prevent echo) */}
      <audio ref={audioRef} autoPlay style={{ display: "none" }} />
    </div>
  );
}

/* ─── Screen Share Preview (draggable, floating) ─── */

function ScreenSharePreview({ stream, onStop }) {
  const videoRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);

  // Default position: bottom-right
  useEffect(() => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    setPos({ x: vw - 360 - 16, y: vh - 240 - 16 });
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !stream) return;
    el.srcObject = stream;
    el.play().catch(() => {});
  }, [stream]);

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { sx: e.clientX, sy: e.clientY, sp: { ...pos } };
    const onMove = (ev) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = ev.clientX - d.sx;
      const dy = ev.clientY - d.sy;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = 360;
      const h = 240;
      setPos({
        x: Math.max(0, Math.min(d.sp.x + dx, vw - w)),
        y: Math.max(0, Math.min(d.sp.y + dy, vh - h)),
      });
    };
    const onUp = () => {
      dragRef.current = null;
      e.currentTarget.releasePointerCapture(e.pointerId);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }, [pos]);

  if (!stream) return null;

  return (
    <div
      style={{
        ...S.floatingPanel,
        left: pos.x,
        top: pos.y,
        width: 360,
        height: 240,
      }}
    >
      <div
        style={S.titleBar}
        onPointerDown={onPointerDown}
      >
        <span style={S.titleBarLabel}><Monitor size={12} /> You are sharing your screen</span>
        <button
          style={{ ...S.smallBtn, ...S.smallBtnDanger }}
          onClick={(e) => {
            e.stopPropagation();
            onStop?.();
          }}
          title="Stop sharing"
        >
          <X size={10} /> Stop
        </button>
      </div>
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={S.videoContain}
        />
        <span style={S.peerLabel}>Screen Share</span>
      </div>
    </div>
  );
}

/* ─── Main component ─── */

export default function RoomCallControls({ roomId, onLocalStream }) {
  const [callActive, setCallActive] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [toasts, setToasts] = useState([]);

  const localStreamRef = useRef(null);
  const remoteStreamsRef = useRef({});
  const currentRoomRef = useRef(roomId);
  const unsubCallEventRef = useRef(null);

  useEffect(() => { currentRoomRef.current = roomId; }, [roomId]);

  /* ── Pass local stream to parent (for header camera preview) ── */
  useEffect(() => {
    if (onLocalStream) onLocalStream(localStream);
  }, [localStream, onLocalStream]);

  /* ─── Toast helper ─── */
  const addToast = useCallback((message, type = "info", icon = null) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type, icon }]);
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ─── Listen for call lifecycle events ─── */
  useEffect(() => {
    unsubCallEventRef.current = onCallEvent((event, data) => {
      switch (event) {
        case "peer-joined":
          addToast(`${data.displayName || "Someone"} joined the call`, "success", <Phone size={14} />);
          break;
        case "peer-left":
          addToast(`${data.displayName || "Someone"} left the call`, "warning", <UserMinus size={14} />);
          break;
        case "peer-disconnected":
          addToast("A connection was lost", "warning", <AlertTriangle size={14} />);
          break;
        case "call-ended":
          addToast("Call ended — all participants left", "info", <PhoneOff size={14} />);
          setCallActive(false);
          setLocalStream(null);
          setScreenStream(null);
          setRemoteStreams({});
          localStreamRef.current = null;
          remoteStreamsRef.current = {};
          setScreenSharing(false);
          setAudioEnabled(true);
          setVideoEnabled(true);
          break;
      }
    });
    return () => { if (unsubCallEventRef.current) unsubCallEventRef.current(); };
  }, [addToast]);

  /* ── Cleanup on unmount / room change ── */
  useEffect(() => {
    return () => {
      leaveCall().catch(() => {});
      setCallActive(false);
      setLocalStream(null);
      setScreenStream(null);
      setRemoteStreams({});
      localStreamRef.current = null;
      remoteStreamsRef.current = {};
      setScreenSharing(false);
      setAudioEnabled(true);
      setVideoEnabled(true);
    };
  }, [roomId]);

  /* ─── Handlers ─── */

  const handleJoin = useCallback(async () => {
    setError(null);
    setJoining(true);
    try {
      const onRemoteStreams = (streams) => {
        remoteStreamsRef.current = streams;
        setRemoteStreams({ ...streams });
      };
      await joinCall(currentRoomRef.current, onRemoteStreams, { audio: audioEnabled, video: videoEnabled });
      localStreamRef.current = getLocalStream();
      setLocalStream(localStreamRef.current);

      // Sync initial track states from actual tracks
      const ls = localStreamRef.current;
      if (ls) {
        const audioTrack = ls.getAudioTracks()[0];
        const videoTrack = ls.getVideoTracks()[0];
        if (audioTrack) setAudioEnabled(audioTrack.enabled);
        if (videoTrack) setVideoEnabled(videoTrack.enabled);
      }

      setCallActive(true);
      addToast("Joined the call", "success", <Phone size={14} />);
    } catch (err) {
      console.error("Join call error:", err);
      setError(err.message || "Failed to join call");
      addToast(err.message || "Failed to join call", "error", <XCircle size={14} />);
    } finally {
      setJoining(false);
    }
  }, [audioEnabled, videoEnabled, addToast]);

  const handleLeave = useCallback(async () => {
    try { await leaveCall(); } catch (_) {}
    setCallActive(false);
    setLocalStream(null);
    setScreenStream(null);
    setRemoteStreams({});
    localStreamRef.current = null;
    remoteStreamsRef.current = {};
    setScreenSharing(false);
    setAudioEnabled(true);
    setVideoEnabled(true);
    addToast("Left the call", "info", <PhoneOff size={14} />);
  }, [addToast]);

  const handleToggleMic = useCallback(() => {
    const newAudio = toggleMicrophone();
    setAudioEnabled(newAudio);
    addToast(newAudio ? "Microphone unmuted" : "Microphone muted", "info", newAudio ? <Mic size={14} /> : <MicOff size={14} />);
  }, [addToast]);

  const handleToggleCamera = useCallback(() => {
    const newVideo = toggleCamera();
    setVideoEnabled(newVideo);
    addToast(newVideo ? "Camera turned on" : "Camera turned off", "info", <Video size={14} />);
  }, [addToast]);

  const handleToggleScreenShare = useCallback(async () => {
    const callState = (await import("../../lib/webrtc")).getCallState();
    if (!callState.callActive) return;
    try {
      if (screenSharing) {
        await stopScreenShare(callState.roomId, callState.callDocId);
        setScreenSharing(false);
        setScreenStream(null);
        addToast("Stopped sharing screen", "info", <Monitor size={14} />);
      } else {
        const ss = await startScreenShare(callState.roomId, callState.callDocId);
        setScreenSharing(true);
        setScreenStream(ss);
        addToast("Sharing screen", "success", <Monitor size={14} />);
      }
    } catch (err) {
      console.error("Screen share error:", err);
      addToast(err.message || "Screen share failed", "error", <XCircle size={14} />);
    }
  }, [screenSharing, addToast]);

  const handleStopScreenShare = useCallback(async () => {
    const callState = (await import("../../lib/webrtc")).getCallState();
    if (!callState.callActive) return;
    try {
      await stopScreenShare(callState.roomId, callState.callDocId);
    } catch (_) {}
    setScreenSharing(false);
    setScreenStream(null);
    addToast("Stopped sharing screen", "info", <Monitor size={14} />);
  }, [addToast]);

  // Also detect screen stream from webrtc module (browser native stop button path)
  useEffect(() => {
    if (!screenSharing) return;
    const checkScreen = setInterval(() => {
      const ss = getScreenStream();
      if (!ss && screenSharing) {
        // Screen was stopped externally (browser native stop)
        setScreenSharing(false);
        setScreenStream(null);
        addToast("Screen sharing ended", "info", <Monitor size={14} />);
      }
    }, 1000);
    return () => clearInterval(checkScreen);
  }, [screenSharing, addToast]);

  const remotePeerCount = Object.keys(remoteStreams).length;
  const firstRemote = Object.entries(remoteStreams)[0];

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {error && (
        <div
          style={{
            position: "fixed", bottom: 70, left: "50%", transform: "translateX(-50%)",
            backgroundColor: "#ef4444", color: "#fff", padding: "8px 16px",
            borderRadius: "var(--radius-md)", fontSize: "0.8rem", fontWeight: 500,
            zIndex: 100, maxWidth: 400, textAlign: "center",
          }}
          onClick={() => setError(null)}
        >
          {error}
        </div>
      )}

      {/* Controls bar */}
      <div style={S.container}>
        {callActive && (
          <span style={joining ? { ...S.statusBadge, ...S.statusBadgeConnecting } : S.statusBadge}>
            {joining ? "Connecting..." : "Live"}
          </span>
        )}

        {!callActive ? (
          <button
            style={{ ...S.btn, ...S.btnJoin }}
            onClick={handleJoin}
            disabled={joining}
            title="Join call"
            aria-label="Join call"
          >
            {joining ? (
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <Phone size={18} />
            )}
          </button>
        ) : (
          <>
            <button
              style={{ ...S.btn, ...(!audioEnabled ? S.btnActive : {}) }}
              onClick={handleToggleMic}
              title={audioEnabled ? "Mute microphone" : "Unmute microphone"}
              aria-label={audioEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              {audioEnabled ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            <button
              style={{ ...S.btn, ...(!videoEnabled ? S.btnActive : {}) }}
              onClick={handleToggleCamera}
              title={videoEnabled ? "Turn off camera" : "Turn on camera"}
              aria-label={videoEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {videoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
            </button>
            <button
              style={{ ...S.btn, ...(screenSharing ? S.btnActive : {}) }}
              onClick={handleToggleScreenShare}
              title={screenSharing ? "Stop screen sharing" : "Share screen"}
              aria-label={screenSharing ? "Stop screen sharing" : "Share screen"}
            >
              <Monitor size={18} />
            </button>
            <button
              style={{ ...S.btn, ...S.btnDanger }}
              onClick={handleLeave}
              title="End call"
              aria-label="End call"
            >
              <PhoneOff size={18} />
            </button>
          </>
        )}

        {callActive && remotePeerCount > 0 && (
          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginLeft: 4 }}>
            {remotePeerCount} other{remotePeerCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Draggable camera preview — shows remote participant's camera */}
      {callActive && firstRemote && (
        <CameraPreview
          stream={firstRemote[1]}
          label={firstRemote[0].slice(0, 8)}
          videoEnabled={true}
        />
      )}

      {/* Screen share preview (draggable, floating) */}
      {callActive && screenSharing && (
        <ScreenSharePreview
          stream={screenStream}
          onStop={handleStopScreenShare}
        />
      )}
    </>
  );
}
