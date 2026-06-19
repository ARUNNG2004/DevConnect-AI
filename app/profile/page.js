"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  doc,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

// ── Preset platforms users can pick from ─────────────────────────────────────
const LINK_PRESETS = [
  { key: "github",    label: "GitHub",    icon: "🐙", placeholder: "https://github.com/username" },
  { key: "twitter",   label: "Twitter/X", icon: "🐦", placeholder: "https://twitter.com/username" },
  { key: "linkedin",  label: "LinkedIn",  icon: "💼", placeholder: "https://linkedin.com/in/username" },
  { key: "website",   label: "Website",   icon: "🌐", placeholder: "https://yourwebsite.com" },
  { key: "youtube",   label: "YouTube",   icon: "▶️", placeholder: "https://youtube.com/@channel" },
  { key: "devto",     label: "Dev.to",    icon: "👩‍💻", placeholder: "https://dev.to/username" },
  { key: "hashnode",  label: "Hashnode",  icon: "📝", placeholder: "https://hashnode.com/@username" },
  { key: "instagram", label: "Instagram", icon: "📸", placeholder: "https://instagram.com/username" },
];

function getPreset(key) {
  return LINK_PRESETS.find((p) => p.key === key) || { icon: "🔗", label: key, placeholder: "https://..." };
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  navbar: {
    position: "fixed", top: 0, left: 0, width: "100%", height: 64,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", background: "var(--bg-secondary)",
    borderBottom: "1px solid var(--border-color)", zIndex: 100,
    backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
    boxSizing: "border-box",
  },
  navbarMobile: { padding: "0 12px" },
  navBrand: {
    fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)",
    textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
    whiteSpace: "nowrap",
  },
  navBrandMobile: { fontSize: "1rem" },
  navActions: { display: "flex", alignItems: "center", gap: 12 },
  navActionsMobile: { gap: 8 },
  btnNavBack: {
    padding: "7px 14px", background: "transparent",
    border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)", fontWeight: 500, cursor: "pointer",
    textDecoration: "none", fontSize: "0.85rem", whiteSpace: "nowrap",
  },
  btnNavBackMobile: { padding: "6px 10px", fontSize: "0.8rem" },
  btnLogout: {
    padding: "7px 14px", background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "var(--radius-md)",
    color: "#ef4444", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem",
    whiteSpace: "nowrap",
  },
  btnLogoutMobile: { padding: "6px 10px", fontSize: "0.8rem" },
  main: { minHeight: "100vh", background: "var(--bg-primary)", paddingTop: 64 },
  container: { maxWidth: "72rem", margin: "36px auto", padding: "0 32px" },
  containerMobile: { maxWidth: "100%", margin: "16px auto", padding: "0 12px" },
  card: {
    backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow-sm)",
  },
  cardMobile: { padding: 16, borderRadius: "var(--radius-md)" },
  divider: { borderTop: "1px solid var(--border-color)" },
  infoLabel: {
    color: "var(--text-muted)", fontSize: "0.72rem", textTransform: "uppercase",
    letterSpacing: "0.05em", margin: "0 0 4px 0", fontWeight: 600,
  },
  infoValue: { color: "var(--text-primary)", fontSize: "0.92rem", margin: 0, lineHeight: 1.5 },
  input: {
    width: "100%", padding: "8px 12px", background: "var(--bg-primary)",
    border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)",
    color: "var(--text-primary)", fontSize: "0.92rem", fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  },
  textarea: {
    width: "100%", padding: "8px 12px", background: "var(--bg-primary)",
    border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)",
    color: "var(--text-primary)", fontSize: "0.9rem", fontFamily: "inherit",
    outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: 72,
    lineHeight: 1.5,
  },
  btnPrimary: {
    padding: "8px 18px", backgroundColor: "var(--accent-primary)", border: "none",
    borderRadius: "var(--radius-md)", color: "#000", fontWeight: 600,
    fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit",
  },
  btnGhost: {
    padding: "8px 18px", backgroundColor: "transparent",
    border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.85rem",
    cursor: "pointer", fontFamily: "inherit",
  },
  btnSignOut: {
    width: "100%", padding: 12, background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "var(--radius-md)",
    color: "#ef4444", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer",
    fontFamily: "inherit",
  },
  successMsg: { color: "var(--accent-success)", fontSize: "0.82rem", margin: "6px 0 0 0" },
  errorMsg: { color: "#ef4444", fontSize: "0.82rem", margin: "6px 0 0 0" },
  postCard: {
    backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)", padding: "14px 16px",
    display: "flex", flexDirection: "column", gap: 8,
  },
  postMeta: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  postTypeTag: {
    fontSize: "0.7rem", fontWeight: 600, padding: "2px 8px",
    borderRadius: "var(--radius-full)", backgroundColor: "var(--accent-primary-alpha)",
    color: "var(--accent-primary)",
  },
  postTimestamp: { fontSize: "0.72rem", color: "var(--text-muted)" },
  postContent: { fontSize: "0.88rem", color: "var(--text-primary)", lineHeight: 1.6, margin: 0 },
  postStats: { display: "flex", gap: 12, fontSize: "0.78rem", color: "var(--text-muted)" },
  modalOverlay: {
    position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16,
  },
  modalBox: {
    backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)", padding: 24, width: "100%", maxWidth: 400,
    maxHeight: "70vh", overflowY: "auto",
  },
  modalHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: { color: "var(--text-primary)", fontWeight: 600, fontSize: "1rem", margin: 0 },
  modalUserRow: {
    display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
    borderBottom: "1px solid var(--border-color)",
  },
  modalAvatar: {
    width: 36, height: 36, borderRadius: "var(--radius-full)",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "0.9rem", fontWeight: 700, color: "#000", flexShrink: 0, overflow: "hidden",
  },
};

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ photoURL, displayName, size = 36 }) {
  return (
    <div style={{ ...S.modalAvatar, width: size, height: size, fontSize: size * 0.38 }}>
      {photoURL
        ? <img src={photoURL} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : (displayName?.charAt(0).toUpperCase() || "U")}
    </div>
  );
}

// ── Followers/Following modal ─────────────────────────────────────────────────
function UserListModal({ title, uids, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!uids || uids.length === 0) { setLoading(false); return; }
    Promise.all(uids.map((uid) => getDoc(doc(db, "users", uid))))
      .then((snaps) => setUsers(snaps.filter((s) => s.exists()).map((s) => s.data())))
      .finally(() => setLoading(false));
  }, [uids]);
  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={S.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <h3 style={S.modalTitle}>{title} ({uids?.length || 0})</h3>
          <button onClick={onClose} style={{ ...S.btnGhost, padding: "4px 10px", fontSize: "0.8rem" }}>✕</button>
        </div>
        {loading ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Loading...</p>
        ) : users.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No users yet.</p>
        ) : users.map((u) => (
          <div key={u.uid} style={S.modalUserRow}>
            <Avatar photoURL={u.photoURL} displayName={u.displayName} size={36} />
            <div>
              <div style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: "0.88rem" }}>{u.displayName || "Anonymous"}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{u.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dynamic links editor (used in both mobile + desktop edit mode) ────────────
// linksInput: [{ key, url }]  — key matches a preset or is "custom_N"
function LinksEditor({ linksInput, setLinksInput }) {
  const [showPicker, setShowPicker] = useState(false);

  const addPreset = (preset) => {
    if (linksInput.find((l) => l.key === preset.key)) return; // already added
    setLinksInput((prev) => [...prev, { key: preset.key, url: "" }]);
    setShowPicker(false);
  };

  const addCustom = () => {
    const id = `custom_${Date.now()}`;
    setLinksInput((prev) => [...prev, { key: id, url: "", label: "" }]);
    setShowPicker(false);
  };

  const removeLink = (key) => setLinksInput((prev) => prev.filter((l) => l.key !== key));

  const updateUrl = (key, url) =>
    setLinksInput((prev) => prev.map((l) => l.key === key ? { ...l, url } : l));

  const updateLabel = (key, label) =>
    setLinksInput((prev) => prev.map((l) => l.key === key ? { ...l, label } : l));

  const availablePresets = LINK_PRESETS.filter((p) => !linksInput.find((l) => l.key === p.key));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {linksInput.length === 0 && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontStyle: "italic", margin: 0 }}>
          No links added yet. Use the button below to add one.
        </p>
      )}

      {linksInput.map((link) => {
        const preset = getPreset(link.key);
        const isCustom = link.key.startsWith("custom_");
        return (
          <div key={link.key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>{preset.icon}</span>
              {isCustom ? (
                <input
                  style={{ ...S.input, flex: 1, fontSize: "0.82rem", padding: "5px 10px" }}
                  value={link.label || ""}
                  onChange={(e) => updateLabel(link.key, e.target.value)}
                  placeholder="Platform name"
                />
              ) : (
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", flex: 1 }}>
                  {preset.label}
                </span>
              )}
              <button
                onClick={() => removeLink(link.key)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1rem", padding: "2px 6px", lineHeight: 1, flexShrink: 0 }}
                title="Remove"
              >✕</button>
            </div>
            <input
              style={{ ...S.input, fontSize: "0.85rem" }}
              value={link.url}
              onChange={(e) => updateUrl(link.key, e.target.value)}
              placeholder={preset.placeholder || "https://..."}
              type="url"
            />
          </div>
        );
      })}

      {/* Add link button + picker */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowPicker((v) => !v)}
          style={{ ...S.btnGhost, fontSize: "0.8rem", padding: "6px 14px", display: "flex", alignItems: "center", gap: 6 }}
        >
          + Add Link
        </button>

        {showPicker && (
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0,
            backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)", padding: 8, zIndex: 50,
            display: "flex", flexDirection: "column", gap: 2, minWidth: 200,
            boxShadow: "var(--shadow-sm)",
          }}>
            {availablePresets.map((p) => (
              <button
                key={p.key}
                onClick={() => addPreset(p)}
                style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "7px 10px", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
              >
                <span>{p.icon}</span> {p.label}
              </button>
            ))}
            {availablePresets.length > 0 && <div style={{ borderTop: "1px solid var(--border-color)", margin: "4px 0" }} />}
            <button
              onClick={addCustom}
              style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: "7px 10px", borderRadius: "var(--radius-sm)", color: "var(--text-secondary)", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 8 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
            >
              🔗 Custom link…
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Links display (view mode) ─────────────────────────────────────────────────
function LinksDisplay({ links }) {
  const entries = Object.entries(links).filter(([, url]) => url);
  if (entries.length === 0) return (
    <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.85rem" }}>No links added yet.</span>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {entries.map(([key, url]) => {
        const p = getPreset(key);
        const label = key.startsWith("custom_") ? (url) : `${p.icon} ${p.label}`;
        return (
          <a key={key} href={url} target="_blank" rel="noreferrer"
            style={{ color: "var(--accent-primary)", fontSize: "0.85rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            {!key.startsWith("custom_") && <span>{p.icon}</span>}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {key.startsWith("custom_") ? url : p.label}
            </span>
          </a>
        );
      })}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
// Convert flat links object (from Firestore) → array for editor
function linksObjToArr(obj) {
  return Object.entries(obj)
    .filter(([, url]) => url)
    .map(([key, url]) => ({ key, url }));
}
// Convert editor array → flat object for Firestore
function linksArrToObj(arr) {
  const obj = {};
  arr.forEach(({ key, url, label }) => {
    if (url) obj[key] = url;
    if (label && key.startsWith("custom_")) obj[`${key}_label`] = label;
  });
  return obj;
}

// ── EditForm (top-level so React never remounts inputs on parent re-render) ───
function EditForm({ nameInput, setNameInput, bioInput, setBioInput, linksInput, setLinksInput, editSaving, editMsg, onSave, onCancel }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={S.infoLabel}>Display Name</div>
        <input
          style={{ ...S.input, marginTop: 4 }}
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
          autoFocus
          placeholder="Your display name"
        />
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={S.infoLabel}>Bio <span style={{ fontWeight: 400 }}>(max 200)</span></div>
          <span style={{ fontSize: "0.72rem", color: bioInput.length > 180 ? "#ef4444" : "var(--text-muted)" }}>
            {bioInput.length}/200
          </span>
        </div>
        <textarea
          style={{ ...S.textarea, marginTop: 4 }}
          value={bioInput}
          onChange={(e) => setBioInput(e.target.value)}
          placeholder="Tell the community about yourself..."
          maxLength={200}
        />
      </div>
      <div>
        <div style={{ ...S.infoLabel, marginBottom: 8 }}>Social Links</div>
        <LinksEditor linksInput={linksInput} setLinksInput={setLinksInput} />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button style={S.btnPrimary} onClick={onSave} disabled={editSaving}>
          {editSaving ? "Saving…" : "Save Changes"}
        </button>
        <button style={S.btnGhost} onClick={onCancel}>Cancel</button>
        {editMsg && (
          <span style={editMsg.type === "success" ? S.successMsg : S.errorMsg}>{editMsg.text}</span>
        )}
      </div>
    </div>
  );
}

// ── AvatarWidget (top-level for same reason) ──────────────────────────────────
function AvatarWidget({ size, currentPhotoURL, displayName, photoUploading, photoMsg, avatarHovered, setAvatarHovered, fileInputRef }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
      <div
        style={{ position: "relative", width: size, height: size, cursor: "pointer" }}
        onMouseEnter={() => setAvatarHovered(true)}
        onMouseLeave={() => setAvatarHovered(false)}
        onClick={() => !photoUploading && fileInputRef.current?.click()}
        title="Click to change photo"
      >
        <div style={{
          width: size, height: size, borderRadius: "var(--radius-full)",
          background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.27, fontWeight: 700, color: "#000",
          border: "3px solid var(--border-color)", overflow: "hidden",
        }}>
          {currentPhotoURL
            ? <img src={currentPhotoURL} alt={displayName || "Avatar"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : (displayName?.charAt(0).toUpperCase() || "U")}
        </div>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "var(--radius-full)",
          backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: size * 0.2,
          opacity: avatarHovered ? 1 : 0, transition: "opacity 0.2s",
        }}>
          {photoUploading ? "⏳" : "📷"}
        </div>
        <div style={{
          position: "absolute", bottom: 2, right: 2, width: Math.round(size * 0.28),
          height: Math.round(size * 0.28), borderRadius: "var(--radius-full)",
          backgroundColor: "var(--accent-primary)", border: "2px solid var(--bg-secondary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.12, zIndex: 2,
        }}>
          {photoUploading ? "⏳" : "📷"}
        </div>
      </div>
      {photoMsg && (
        <p style={{ ...(photoMsg.type === "success" ? S.successMsg : S.errorMsg), textAlign: "center", fontSize: "0.75rem", margin: 0 }}>
          {photoMsg.text}
        </p>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, logout, loading } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const isMobile = useIsMobile();
  const fileInputRef = useRef(null);

  const [currentPhotoURL, setCurrentPhotoURL] = useState("");
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoMsg, setPhotoMsg] = useState(null);

  // unified edit state
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [linksInput, setLinksInput] = useState([]); // [{ key, url, label? }]
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState(null);

  // saved values
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState({});

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [postCount, setPostCount] = useState(0);

  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);
  useEffect(() => { if (user) setCurrentPhotoURL(user.photoURL || ""); }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setBio(data.bio || "");
      // collect all link keys from data (any key that starts with known preset or custom_)
      const linkObj = {};
      LINK_PRESETS.forEach(({ key }) => { if (data[key]) linkObj[key] = data[key]; });
      // pick up custom_ keys
      Object.keys(data).forEach((k) => { if (k.startsWith("custom_") && !k.endsWith("_label")) linkObj[k] = data[k]; });
      setLinks(linkObj);
      setFollowers(data.followers || []);
      setFollowing(data.following || []);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "posts"), where("uid", "==", user.uid), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPostCount(snap.size);
      setMyPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
      <p style={{ color: "var(--text-muted)" }}>Loading...</p>
    </div>
  );
  if (!user) return null;

  const joinedDate = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";

  // ── Open edit mode ──────────────────────────────────────────────────────────
  const startEditing = () => {
    setNameInput(user.displayName || "");
    setBioInput(bio);
    setLinksInput(linksObjToArr(links));
    setEditing(true);
    setEditMsg(null);
  };

  // ── Save everything ─────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!nameInput.trim()) { setEditMsg({ type: "error", text: "Name cannot be empty." }); return; }
    if (bioInput.length > 200) { setEditMsg({ type: "error", text: "Bio must be 200 chars or less." }); return; }
    setEditSaving(true); setEditMsg(null);
    try {
      await updateProfile(user, { displayName: nameInput.trim() });
      // build links object — first clear all old link keys, then set new ones
      const cleanedLinks = {};
      LINK_PRESETS.forEach(({ key }) => { cleanedLinks[key] = ""; });
      // clear old custom keys (we'll re-save current ones)
      Object.keys(links).forEach((k) => { if (k.startsWith("custom_")) cleanedLinks[k] = ""; });
      const newLinks = linksArrToObj(linksInput);
      await setDoc(doc(db, "users", user.uid), {
        displayName: nameInput.trim(),
        bio: bioInput.trim(),
        ...cleanedLinks,
        ...newLinks,
      }, { merge: true });
      setEditMsg({ type: "success", text: "Profile updated!" });
      setTimeout(() => { setEditing(false); setEditMsg(null); }, 900);
    } catch {
      setEditMsg({ type: "error", text: "Failed to save. Try again." });
    } finally { setEditSaving(false); }
  };

  // ── Photo ───────────────────────────────────────────────────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setPhotoMsg({ type: "error", text: "Please select an image file." }); return; }
    if (file.size > 5 * 1024 * 1024) { setPhotoMsg({ type: "error", text: "Image must be under 5MB." }); return; }
    setPhotoUploading(true); setPhotoMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      formData.append("public_id", `avatars/${user.uid}`);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");
      const photoURL = data.secure_url;
      await updateProfile(user, { photoURL });
      await setDoc(doc(db, "users", user.uid), { photoURL }, { merge: true });
      setCurrentPhotoURL(photoURL);
      setPhotoMsg({ type: "success", text: "Photo updated!" });
    } catch { setPhotoMsg({ type: "error", text: "Upload failed. Try again." }); }
    finally { setPhotoUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleLogout = async () => {
    try { await logout(); router.push("/login"); }
    catch { console.error("Logout failed"); }
  };

  const cm = isMobile ? S.cardMobile : {};

  return (
    <main style={S.main}>
      {/* ── Navbar ── */}
      <header style={{ ...S.navbar, ...(isMobile ? S.navbarMobile : {}) }}>
        <Link href="/dashboard" style={{ ...S.navBrand, ...(isMobile ? S.navBrandMobile : {}) }}>
          <span>{isMobile ? "🧠 DevConnect" : "🧠 DevConnect AI"}</span>
        </Link>
        <div style={{ ...S.navActions, ...(isMobile ? S.navActionsMobile : {}) }}>
          <button
            onClick={toggleTheme}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, flexShrink: 0, background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--radius-full)", color: "var(--text-secondary)", cursor: "pointer", fontSize: isMobile ? "1rem" : "1.1rem" }}
            title="Toggle theme"
          >{isDarkMode ? "☀️" : "🌙"}</button>
          <Link href="/dashboard" style={{ ...S.btnNavBack, ...(isMobile ? S.btnNavBackMobile : {}) }}>
            {isMobile ? "←" : "← Dashboard"}
          </Link>
          <button onClick={handleLogout} style={{ ...S.btnLogout, ...(isMobile ? S.btnLogoutMobile : {}) }}>
            {isMobile ? "🚪" : "🚪 Logout"}
          </button>
        </div>
      </header>

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />

      <div style={isMobile ? S.containerMobile : S.container}>
        {isMobile ? (
          /* ════════ MOBILE LAYOUT ════════ */
          <>
            {/* Hero card */}
            <div style={{ ...S.card, ...cm }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <AvatarWidget size={76} currentPhotoURL={currentPhotoURL} displayName={user.displayName} photoUploading={photoUploading} photoMsg={photoMsg} avatarHovered={avatarHovered} setAvatarHovered={setAvatarHovered} fileInputRef={fileInputRef} />

                {editing ? (
                  <div style={{ width: "100%" }}>
                    <EditForm
                      nameInput={nameInput} setNameInput={setNameInput}
                      bioInput={bioInput} setBioInput={setBioInput}
                      linksInput={linksInput} setLinksInput={setLinksInput}
                      editSaving={editSaving} editMsg={editMsg}
                      onSave={handleSaveProfile}
                      onCancel={() => { setEditing(false); setEditMsg(null); }}
                    />
                  </div>
                ) : (
                  <>
                    <div style={{ textAlign: "center" }}>
                      <h1 style={{ color: "var(--text-primary)", margin: "0 0 4px 0", fontSize: "1.2rem" }}>
                        {user.displayName || "Anonymous User"}
                      </h1>
                      <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.88rem", wordBreak: "break-word" }}>{user.email}</p>
                    </div>
                    {bio && <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", textAlign: "center", margin: 0, maxWidth: 300 }}>{bio}</p>}
                    {Object.keys(links).length > 0 && (
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                        {Object.entries(links).filter(([, url]) => url).map(([key, url]) => {
                          const p = getPreset(key);
                          return (
                            <a key={key} href={url} target="_blank" rel="noreferrer"
                              style={{ color: "var(--accent-primary)", fontSize: "0.82rem", textDecoration: "none" }}>
                              {p.icon} {key.startsWith("custom_") ? url : p.label}
                            </a>
                          );
                        })}
                      </div>
                    )}
                    <button onClick={startEditing} style={{ ...S.btnGhost, fontSize: "0.82rem", padding: "6px 14px" }}>✏️ Edit Profile</button>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
              {[
                { label: "Posts", value: postCount, accent: true, onClick: null },
                { label: "Followers", value: followers.length, onClick: () => setShowFollowers(true) },
                { label: "Following", value: following.length, onClick: () => setShowFollowing(true) },
                { label: "Joined", value: joinedDate, small: true, onClick: null },
              ].map(({ label, value, accent, small, onClick }) => (
                <div key={label} onClick={onClick}
                  style={{ ...S.card, ...cm, textAlign: "center", cursor: onClick ? "pointer" : "default" }}
                  onMouseEnter={(e) => { if (onClick) e.currentTarget.style.borderColor = "var(--accent-primary)"; }}
                  onMouseLeave={(e) => { if (onClick) e.currentTarget.style.borderColor = "var(--border-color)"; }}
                >
                  <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginBottom: 6 }}>{label}</div>
                  <div style={{ color: accent ? "var(--accent-primary)" : "var(--text-primary)", fontSize: small ? "0.85rem" : "1.5rem", fontWeight: small ? 600 : 700 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Account info (read-only on mobile, editing handled in hero card) */}
            <div style={{ ...S.card, ...cm, marginTop: 14 }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: "1rem", margin: "0 0 16px 0", fontWeight: 600 }}>Account</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><div style={S.infoLabel}>Email</div><div style={{ ...S.infoValue, wordBreak: "break-word" }}>{user.email}</div></div>
                <div style={S.divider} />
                <div><div style={S.infoLabel}>Account Status</div><div style={{ ...S.infoValue, color: "var(--accent-success)" }}>✅ Active</div></div>
              </div>
              <button onClick={handleLogout} style={{ ...S.btnSignOut, marginTop: 20 }}>Sign Out</button>
            </div>

            {/* Posts */}
            <PostsSection myPosts={myPosts} postCount={postCount} S={S} cm={cm} />
            <div style={{ height: 40 }} />
          </>
        ) : (
          /* ════════ DESKTOP LAYOUT ════════ */
          <>
            {/* ── Hero card ── */}
            <div style={{ ...S.card, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 28 }}>
                <AvatarWidget size={100} currentPhotoURL={currentPhotoURL} displayName={user.displayName} photoUploading={photoUploading} photoMsg={photoMsg} avatarHovered={avatarHovered} setAvatarHovered={setAvatarHovered} fileInputRef={fileInputRef} />

                {/* Name / bio / links — or edit form */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editing ? (
                    <EditForm
                      nameInput={nameInput} setNameInput={setNameInput}
                      bioInput={bioInput} setBioInput={setBioInput}
                      linksInput={linksInput} setLinksInput={setLinksInput}
                      editSaving={editSaving} editMsg={editMsg}
                      onSave={handleSaveProfile}
                      onCancel={() => { setEditing(false); setEditMsg(null); }}
                    />
                  ) : (
                    <>
                      <h1 style={{ color: "var(--text-primary)", margin: "0 0 4px 0", fontSize: "1.5rem", fontWeight: 700 }}>
                        {user.displayName || "Anonymous User"}
                      </h1>
                      <p style={{ color: "var(--text-muted)", margin: "0 0 8px 0", fontSize: "0.9rem" }}>{user.email}</p>
                      {bio && (
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0 0 12px 0", lineHeight: 1.6, maxWidth: 560 }}>{bio}</p>
                      )}
                      {Object.keys(links).filter(k => links[k]).length > 0 && (
                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                          {Object.entries(links).filter(([, url]) => url).map(([key, url]) => {
                            const p = getPreset(key);
                            return (
                              <a key={key} href={url} target="_blank" rel="noreferrer"
                                style={{ color: "var(--accent-primary)", fontSize: "0.85rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                                <span>{p.icon}</span>
                                <span>{key.startsWith("custom_") ? url : p.label}</span>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Top-right: Edit + stats (only in view mode) */}
                {!editing && (
                  <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
                    <button onClick={startEditing} style={{ ...S.btnGhost, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                      ✏️ Edit Profile
                    </button>
                    <div style={{ display: "flex", gap: 20, textAlign: "center" }}>
                      {[
                        { label: "Posts", value: postCount, accent: true, onClick: null },
                        { label: "Followers", value: followers.length, onClick: () => setShowFollowers(true) },
                        { label: "Following", value: following.length, onClick: () => setShowFollowing(true) },
                      ].map(({ label, value, accent, onClick }) => (
                        <div key={label} onClick={onClick}
                          style={{ cursor: onClick ? "pointer" : "default", padding: "4px 8px", borderRadius: "var(--radius-md)", transition: "background 0.15s" }}
                          onMouseEnter={(e) => { if (onClick) e.currentTarget.style.background = "var(--bg-primary)"; }}
                          onMouseLeave={(e) => { if (onClick) e.currentTarget.style.background = "transparent"; }}
                        >
                          <div style={{ color: accent ? "var(--accent-primary)" : "var(--text-primary)", fontSize: "1.4rem", fontWeight: 700, lineHeight: 1 }}>{value}</div>
                          <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: 3 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Joined {joinedDate}</div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Two-column bottom ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20, alignItems: "start" }}>

              {/* LEFT: Account details */}
              <div style={{ ...S.card, height: "100%", boxSizing: "border-box" }}>
                <h2 style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0 0 18px 0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Account</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <div style={S.infoLabel}>Email</div>
                    <div style={{ ...S.infoValue, wordBreak: "break-word" }}>{user.email}</div>
                  </div>
                  <div style={S.divider} />
                  <div>
                    <div style={S.infoLabel}>Display Name</div>
                    <div style={S.infoValue}>{user.displayName || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Not set</span>}</div>
                  </div>
                  <div style={S.divider} />
                  <div>
                    <div style={S.infoLabel}>Bio</div>
                    <div style={{ ...S.infoValue, color: bio ? "var(--text-primary)" : "var(--text-muted)", fontStyle: bio ? "normal" : "italic", fontSize: "0.88rem", lineHeight: 1.55 }}>
                      {bio || "No bio yet."}
                    </div>
                  </div>
                  <div style={S.divider} />
                  <div>
                    <div style={{ ...S.infoLabel, marginBottom: 8 }}>Social Links</div>
                    <LinksDisplay links={links} />
                  </div>
                  <div style={S.divider} />
                  <div>
                    <div style={S.infoLabel}>Account Status</div>
                    <div style={{ ...S.infoValue, color: "var(--accent-success)" }}>✅ Active</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{ ...S.btnSignOut, marginTop: 24 }}
                  onMouseEnter={(e) => { e.target.style.background = "rgba(239, 68, 68, 0.15)"; }}
                  onMouseLeave={(e) => { e.target.style.background = "rgba(239, 68, 68, 0.1)"; }}
                >Sign Out</button>
              </div>

              {/* RIGHT: My Posts */}
              <div style={{ ...S.card, height: "100%", boxSizing: "border-box" }}>
                <h2 style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0 0 18px 0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>My Posts</span>
                  <span style={{ color: "var(--accent-primary)", fontWeight: 700, fontSize: "1rem", textTransform: "none", letterSpacing: 0 }}>{postCount}</span>
                </h2>
                {myPosts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0 0 14px 0" }}>You haven't posted anything yet.</p>
                    <Link href="/dashboard" style={{ ...S.btnPrimary, textDecoration: "none", display: "inline-block" }}>Go to Dashboard</Link>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 520, overflowY: "auto" }}>
                    {myPosts.map((post) => <PostCard key={post.id} post={post} S={S} />)}
                  </div>
                )}
              </div>
            </div>

            <div style={{ height: 40 }} />
          </>
        )}
      </div>

      {showFollowers && <UserListModal title="Followers" uids={followers} onClose={() => setShowFollowers(false)} />}
      {showFollowing && <UserListModal title="Following" uids={following} onClose={() => setShowFollowing(false)} />}
    </main>
  );
}

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post, S }) {
  const typeLabel = post.postType === "question" ? "Question" : post.postType === "collaboration" ? "Collaborate" : "Discussion";
  const ts = post.timestamp?.toDate
    ? post.timestamp.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Recently";
  const snippet = post.content?.replace(/[#*`>_~]/g, "").slice(0, 140) + (post.content?.length > 140 ? "…" : "");
  return (
    <Link href="/dashboard" style={{ textDecoration: "none" }}>
      <div style={S.postCard}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-primary)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; }}>
        <div style={S.postMeta}>
          <span style={S.postTypeTag}>{typeLabel}</span>
          <span style={S.postTimestamp}>{ts}{post.edited ? " (edited)" : ""}</span>
        </div>
        <p style={S.postContent}>{snippet || "(no content)"}</p>
        {post.tags?.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {post.tags.map((t) => (
              <span key={t} style={{ fontSize: "0.7rem", color: "var(--accent-primary)", background: "var(--accent-primary-alpha)", padding: "2px 7px", borderRadius: "var(--radius-full)" }}>{t}</span>
            ))}
          </div>
        )}
        <div style={S.postStats}>
          <span>♡ {post.likes || 0}</span>
          <span>💬 {post.comments?.length || 0}</span>
        </div>
      </div>
    </Link>
  );
}

// ── Posts section (mobile) ────────────────────────────────────────────────────
function PostsSection({ myPosts, postCount, S, cm }) {
  return (
    <div style={{ ...S.card, ...cm, marginTop: 14 }}>
      <h2 style={{ color: "var(--text-primary)", fontSize: "1rem", margin: "0 0 16px 0", fontWeight: 600 }}>
        My Posts <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "0.85rem" }}>({postCount})</span>
      </h2>
      {myPosts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: "0 0 12px 0" }}>You haven't posted anything yet.</p>
          <Link href="/dashboard" style={{ padding: "8px 18px", backgroundColor: "var(--accent-primary)", border: "none", borderRadius: "var(--radius-md)", color: "#000", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none", display: "inline-block" }}>
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {myPosts.map((post) => <PostCard key={post.id} post={post} S={S} />)}
        </div>
      )}
    </div>
  );
}