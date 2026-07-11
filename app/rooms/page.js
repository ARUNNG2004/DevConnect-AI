"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import ProtectedRoute from "../../components/ProtectedRoute";
import Navbar from "../../components/Navbar";
import { createRoom, deleteRoom } from "../../lib/rooms";
import { Trash2, DoorOpen, Lock } from "lucide-react";

const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "Go",
  "Rust",
  "React",
  "Node.js",
  "Other",
];

const S = {
  page: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "var(--bg-primary)",
  },
  container: {
    maxWidth: 960,
    width: "100%",
    margin: "0 auto",
    padding: "24px 24px 64px",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "var(--text-muted)",
    margin: "4px 0 0 0",
  },
  createBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    backgroundColor: "var(--accent-primary)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  createBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16,
  },
  modal: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 28,
    width: "100%",
    maxWidth: 480,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  modalTitle: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  input: {
    padding: "10px 12px",
    backgroundColor: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    outline: "none",
  },
  textarea: {
    padding: "10px 12px",
    backgroundColor: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
    minHeight: 60,
  },
  select: {
    padding: "10px 12px",
    backgroundColor: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    outline: "none",
    cursor: "pointer",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    cursor: "pointer",
  },
  modalActions: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: "10px 18px",
    backgroundColor: "transparent",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)",
    fontWeight: 500,
    fontSize: "0.85rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  submitBtn: {
    padding: "10px 18px",
    backgroundColor: "var(--accent-primary)",
    color: "#fff",
    border: "none",
    borderRadius: "var(--radius-md)",
    fontWeight: 600,
    fontSize: "0.85rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  roomGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 16,
  },
  roomCard: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 20,
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    cursor: "pointer",
    transition: "border-color 0.15s, box-shadow 0.15s",
    textDecoration: "none",
  },
  roomCardTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  roomCardDesc: {
    fontSize: "0.82rem",
    color: "var(--text-muted)",
    margin: 0,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  roomCardMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginTop: "auto",
  },
  langBadge: {
    display: "inline-block",
    padding: "3px 8px",
    backgroundColor: "var(--accent-primary-alpha)",
    color: "var(--accent-primary)",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.72rem",
    fontWeight: 600,
  },
  metaText: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: "64px 24px",
    color: "var(--text-muted)",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "3rem",
  },
  emptyTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    margin: 0,
  },
  emptyDesc: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
    margin: 0,
    maxWidth: 360,
  },
};

function timeAgo(timestamp) {
  if (!timestamp) return "";
  const now = Date.now();
  const then = timestamp.toMillis ? timestamp.toMillis() : new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function CreateRoomModal({ onClose, onSubmit, submitting }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim(), language, isPrivate });
  };

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={S.modalTitle}>Create a Room</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={S.formGroup}>
            <label style={S.label}>Room Name *</label>
            <input
              style={S.input}
              type="text"
              placeholder="e.g. React debugging session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Description</label>
            <textarea
              style={S.textarea}
              placeholder="What will this room be used for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Language / Stack</label>
            <select
              style={S.select}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <label style={S.checkboxRow}>
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            Private room (invite only)
          </label>
          <div style={S.modalActions}>
            <button type="button" style={S.cancelBtn} onClick={onClose}>Cancel</button>
            <button
              type="submit"
              style={{ ...S.submitBtn, ...(submitting ? S.createBtnDisabled : {}) }}
              disabled={submitting || !title.trim()}
            >
              {submitting ? "Creating..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RoomsHubPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "rooms"), orderBy("lastActivity", "desc"));
    unsubRef.current = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRooms(list);
    });
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [user]);

  const handleCreate = async ({ title, description, language, isPrivate }) => {
    setSubmitting(true);
    try {
      const roomId = await createRoom({ title, description, language, isPrivate });
      setShowModal(false);
      if (roomId) router.push(`/rooms/${roomId}`);
    } catch (err) {
      console.error("Failed to create room:", err);
      alert("Failed to create room. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div style={S.page}>
        {/* <Navbar /> */}
        <div style={S.container}>
          <div style={S.headerRow}>
            <button
              onClick={() => router.push('/dashboard')}
              style={{ ...S.createBtn, padding: '8px 16px', fontSize: '0.85rem', backgroundColor: 'var(--bg-secondary)' }}
            >
              ← Dashboard
            </button>
            <div>
              <h1 style={S.title}>Collaboration Rooms</h1>
              <p style={S.subtitle}>Create a room to code, chat, and collaborate in real time.</p>
            </div>
            <button
              style={S.createBtn}
              onClick={() => setShowModal(true)}
            >
              + New Room
            </button>
          </div>

          {rooms.length === 0 ? (
            <div style={S.emptyState}>
              <div style={S.emptyIcon}><DoorOpen size={48} /></div>
              <p style={S.emptyTitle}>No rooms yet</p>
              <p style={S.emptyDesc}>
                Create the first room and start collaborating with other developers in real time.
              </p>
            </div>
          ) : (
            <div style={S.roomGrid}>
              {rooms.map((room) => (
                <div
                  key={room.id}
                  style={{ ...S.roomCard, position: 'relative' }}
                  onClick={() => router.push(`/rooms/${room.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-primary)";
                    e.currentTarget.style.boxShadow = "0 0 0 1px var(--accent-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-color)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {room.createdBy?.uid === user?.uid && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
                          deleteRoom(room.id).then(() => {
                            // Room will be removed from list via real-time update
                          }).catch(err => {
                            alert('Failed to delete room: ' + err.message);
                          });
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                        e.currentTarget.style.borderColor = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.borderColor = '#ef4444';
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <h3 style={S.roomCardTitle}>{room.title}</h3>
                  {room.description && (
                    <p style={S.roomCardDesc}>{room.description}</p>
                  )}
                  <div style={S.roomCardMeta}>
                    <span style={S.langBadge}>{room.language}</span>
                    <span style={S.metaText}>
                      {room.members?.length || 1} member{(room.members?.length || 1) !== 1 ? "s" : ""}
                    </span>
                    <span style={S.metaText}>{timeAgo(room.lastActivity)}</span>
                    {room.isPrivate && (
                      <Lock size={12} style={{ color: "var(--text-muted)" }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <CreateRoomModal
            onClose={() => setShowModal(false)}
            onSubmit={handleCreate}
            submitting={submitting}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
