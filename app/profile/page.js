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
  deleteDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { updateProfile, deleteUser } from "firebase/auth";

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

const SKILL_PRESETS = [
  { key: "frontend",   label: "Frontend Developer",  color: "#3b82f6" },
  { key: "backend",    label: "Backend Developer",   color: "#8b5cf6" },
  { key: "fullstack",  label: "Full Stack Developer", color: "#10b981" },
  { key: "mobile",     label: "Mobile Developer",    color: "#f97316" },
  { key: "devops",     label: "DevOps Engineer",     color: "#ef4444" },
  { key: "ai_ml",      label: "AI / ML Engineer",    color: "#06b6d4" },
  { key: "design",     label: "UI/UX Designer",      color: "#ec4899" },
  { key: "data",       label: "Data Scientist",      color: "#eab308" },
  { key: "blockchain", label: "Blockchain Dev",      color: "#6366f1" },
];
const MAX_SKILLS = 8;
const MAX_PINNED = 2;

function getSkillMeta(key) {
  return SKILL_PRESETS.find((s) => s.key === key) || { key, label: key, color: "#64748b" };
}

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
  btnDeleteAccount: {
    width: "100%", padding: 12, background: "transparent",
    border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "var(--radius-md)",
    color: "rgba(239, 68, 68, 0.6)", fontWeight: 500, fontSize: "0.88rem",
    cursor: "pointer", fontFamily: "inherit", marginTop: 8,
    transition: "all 0.15s",
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
  // ── GitHub Roast styles ───────────────────────────────────────────────────
  roastCard: {
    backgroundColor: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    padding: "14px 16px",
    marginTop: 14,
  },
  roastHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 8, marginBottom: 12,
  },
  roastTitle: {
    color: "var(--text-primary)", fontWeight: 700, fontSize: "0.92rem", margin: 0,
    display: "flex", alignItems: "center", gap: 6,
  },
  statPill: {
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "3px 10px", borderRadius: "var(--radius-full)",
    fontSize: "0.74rem", fontWeight: 600,
    border: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-secondary)",
    color: "var(--text-secondary)",
  },
  roastText: {
    fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.65,
    whiteSpace: "pre-wrap", margin: 0,
  },
  btnRoast: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 16px",
    backgroundColor: "transparent",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)",
    fontWeight: 600, fontSize: "0.82rem",
    cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  },
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

// ── Delete Account Confirmation Modal ─────────────────────────────────────────
function DeleteAccountModal({ onConfirm, onClose, deleting, deleteError }) {
  const [confirmText, setConfirmText] = useState("");
  const canDelete = confirmText === "DELETE";

  return (
    <div style={S.modalOverlay} onClick={onClose}>
      <div style={{ ...S.modalBox, maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>⚠️</div>
          <h3 style={{ color: "#ef4444", fontWeight: 700, fontSize: "1.1rem", margin: "0 0 6px 0" }}>
            Delete Account
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
            This action is <strong style={{ color: "var(--text-primary)" }}>permanent and irreversible</strong>.
            Your profile, posts, and all data will be deleted forever.
          </p>
        </div>

        {/* Warning box */}
        <div style={{
          background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)",
          borderRadius: "var(--radius-md)", padding: "12px 14px", marginBottom: 18,
        }}>
          <p style={{ color: "#ef4444", fontSize: "0.8rem", margin: 0, lineHeight: 1.6 }}>
            You will lose access to:<br />
            • Your profile and bio<br />
            • All your posts and comments<br />
            • Your followers and following list<br />
            • Your activity streak
          </p>
        </div>

        {/* Confirmation input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ ...S.infoLabel, display: "block", marginBottom: 6 }}>
            Type <strong style={{ color: "#ef4444", fontStyle: "normal" }}>DELETE</strong> to confirm
          </label>
          <input
            style={{
              ...S.input,
              borderColor: confirmText && !canDelete ? "rgba(239,68,68,0.5)" : "var(--border-color)",
            }}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            autoFocus
          />
        </div>

        {deleteError && (
          <p style={{ ...S.errorMsg, marginBottom: 12 }}>{deleteError}</p>
        )}

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() => canDelete && onConfirm()}
            disabled={!canDelete || deleting}
            style={{
              width: "100%", padding: "11px 0",
              background: canDelete ? "#ef4444" : "rgba(239,68,68,0.2)",
              border: "none", borderRadius: "var(--radius-md)",
              color: canDelete ? "#fff" : "rgba(239,68,68,0.5)",
              fontWeight: 700, fontSize: "0.92rem", cursor: canDelete && !deleting ? "pointer" : "not-allowed",
              fontFamily: "inherit", transition: "all 0.15s",
            }}
          >
            {deleting ? "Deleting…" : "Yes, permanently delete my account"}
          </button>
          <button
            onClick={onClose}
            disabled={deleting}
            style={{ ...S.btnGhost, width: "100%", textAlign: "center" }}
          >
            Cancel, keep my account
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dynamic links editor ──────────────────────────────────────────────────────
function LinksEditor({ linksInput, setLinksInput }) {
  const [showPicker, setShowPicker] = useState(false);

  const addPreset = (preset) => {
    if (linksInput.find((l) => l.key === preset.key)) return;
    setLinksInput((prev) => [...prev, { key: preset.key, url: "" }]);
    setShowPicker(false);
  };

  const addCustom = () => {
    const id = `custom_${Date.now()}`;
    setLinksInput((prev) => [...prev, { key: id, url: "", label: "" }]);
    setShowPicker(false);
  };

  const removeLink = (key) => setLinksInput((prev) => prev.filter((l) => l.key !== key));
  const updateUrl = (key, url) => setLinksInput((prev) => prev.map((l) => l.key === key ? { ...l, url } : l));
  const updateLabel = (key, label) => setLinksInput((prev) => prev.map((l) => l.key === key ? { ...l, label } : l));
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

// ── Skills picker (edit mode) ─────────────────────────────────────────────────
function SkillsPicker({ skillsInput, setSkillsInput }) {
  const [customText, setCustomText] = useState("");
  const atLimit = skillsInput.length >= MAX_SKILLS;

  const togglePreset = (key) => {
    setSkillsInput((prev) => {
      if (prev.includes(key)) return prev.filter((s) => s !== key);
      if (prev.length >= MAX_SKILLS) return prev;
      return [...prev, key];
    });
  };

  const addCustom = () => {
    const text = customText.trim();
    if (!text) return;
    setCustomText("");
    if (skillsInput.some((s) => s.toLowerCase() === text.toLowerCase())) return;
    if (skillsInput.length >= MAX_SKILLS) return;
    setSkillsInput((prev) => [...prev, text]);
  };

  const removeSkill = (key) => setSkillsInput((prev) => prev.filter((s) => s !== key));
  const customSkills = skillsInput.filter((s) => !SKILL_PRESETS.find((p) => p.key === s));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {SKILL_PRESETS.map((opt) => {
          const active = skillsInput.includes(opt.key);
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => togglePreset(opt.key)}
              disabled={!active && atLimit}
              style={{
                padding: "5px 12px", borderRadius: "var(--radius-full)",
                border: `1px solid ${active ? opt.color : "var(--border-color)"}`,
                background: active ? `${opt.color}22` : "transparent",
                color: active ? opt.color : "var(--text-secondary)",
                fontSize: "0.78rem", fontWeight: 600, fontFamily: "inherit",
                cursor: (!active && atLimit) ? "not-allowed" : "pointer",
                opacity: (!active && atLimit) ? 0.5 : 1,
                transition: "all 0.15s",
              }}
            >
              {active ? "✓ " : ""}{opt.label}
            </button>
          );
        })}
      </div>
      {customSkills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {customSkills.map((s) => (
            <span key={s} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 10px", borderRadius: "var(--radius-full)",
              border: "1px solid #64748b88", background: "#64748b22",
              color: "#94a3b8", fontSize: "0.78rem", fontWeight: 600,
            }}>
              {s}
              <button
                onClick={() => removeSkill(s)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "0.75rem", padding: 0, lineHeight: 1 }}
                title="Remove"
              >✕</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 6 }}>
        <input
          style={{ ...S.input, fontSize: "0.82rem", padding: "6px 10px" }}
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
          placeholder="Other (e.g. Game Dev, QA)…"
          maxLength={24}
          disabled={atLimit}
        />
        <button onClick={addCustom} type="button" disabled={atLimit} style={{ ...S.btnGhost, fontSize: "0.78rem", padding: "6px 14px", whiteSpace: "nowrap", opacity: atLimit ? 0.5 : 1, cursor: atLimit ? "not-allowed" : "pointer" }}>
          + Add
        </button>
      </div>
      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{skillsInput.length}/{MAX_SKILLS} selected</span>
    </div>
  );
}

// ── Skill badges (view mode) ──────────────────────────────────────────────────
function SkillBadges({ skills }) {
  if (!skills || skills.length === 0) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {skills.map((key) => {
        const meta = getSkillMeta(key);
        return (
          <span key={key} style={{
            padding: "3px 11px", borderRadius: "var(--radius-full)",
            border: `1px solid ${meta.color}55`, background: `${meta.color}1a`,
            color: meta.color, fontSize: "0.74rem", fontWeight: 600,
          }}>
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}

// ── Collab toggle (edit mode) ─────────────────────────────────────────────────
function CollabToggle({ value, onChange, disabled = false, label = "Open to Collaboration" }) {
  return (
    <div
      onClick={() => { if (!disabled) onChange(!value); }}
      role="switch"
      aria-checked={value}
      aria-disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        cursor: disabled ? "default" : "pointer", userSelect: "none",
        opacity: disabled ? 0.6 : 1, transition: "opacity 0.15s",
      }}
    >
      <div style={{
        width: 40, height: 22, borderRadius: "var(--radius-full)",
        background: value ? "#22c55e" : "var(--border-color)",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: 2, left: value ? 20 : 2,
          width: 18, height: 18, borderRadius: "50%", background: "#fff",
          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }} />
      </div>
      <span style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ── Collab badge (view mode) ──────────────────────────────────────────────────
function CollabBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 11px", borderRadius: "var(--radius-full)",
      background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.4)",
      color: "#22c55e", fontSize: "0.74rem", fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
      Open to Collaborate
    </span>
  );
}

// ── Streak badge (view mode) ──────────────────────────────────────────────────
function StreakBadge({ count }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 11px", borderRadius: "var(--radius-full)",
      background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.4)",
      color: "#fb923c", fontSize: "0.74rem", fontWeight: 700,
    }}>
      🔥 {count} day streak
    </span>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function linksObjToArr(obj) {
  return Object.entries(obj).filter(([, url]) => url).map(([key, url]) => ({ key, url }));
}
function linksArrToObj(arr) {
  const obj = {};
  arr.forEach(({ key, url, label }) => {
    if (url) obj[key] = url;
    if (label && key.startsWith("custom_")) obj[`${key}_label`] = label;
  });
  return obj;
}

// ── EditForm ──────────────────────────────────────────────────────────────────
function EditForm({
  nameInput, setNameInput, bioInput, setBioInput, linksInput, setLinksInput,
  skillsInput, setSkillsInput, collabInput, setCollabInput,
  editSaving, editMsg, onSave, onCancel,
}) {
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
        <div style={{ ...S.infoLabel, marginBottom: 8 }}>Tech Stack / Skills</div>
        <SkillsPicker skillsInput={skillsInput} setSkillsInput={setSkillsInput} />
      </div>
      <div>
        <div style={{ ...S.infoLabel, marginBottom: 8 }}>Collaboration</div>
        <CollabToggle value={collabInput} onChange={setCollabInput} />
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

// ── AvatarWidget ──────────────────────────────────────────────────────────────
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

// ── Post card ─────────────────────────────────────────────────────────────────
function PostCard({ post, S, pinned, onTogglePin, pinDisabled }) {
  const typeLabel = post.postType === "question" ? "Question" : post.postType === "collaboration" ? "Collaborate" : "Discussion";
  const ts = post.timestamp?.toDate
    ? post.timestamp.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Recently";
  const snippet = post.content?.replace(/[#*`>_~]/g, "").slice(0, 140) + (post.content?.length > 140 ? "…" : "");

  return (
    <div
  style={{
    ...S.postCard,
    ...(pinned ? { border: "1px solid var(--accent-primary)", boxShadow: "0 0 0 1px var(--accent-primary-alpha)" } : {}),
  }}
  onMouseEnter={(e) => { if (!pinned) e.currentTarget.style.border = "1px solid var(--accent-primary)"; }}
  onMouseLeave={(e) => { if (!pinned) e.currentTarget.style.border = "1px solid var(--border-color)"; }}
>
      <div style={S.postMeta}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={S.postTypeTag}>{typeLabel}</span>
          {pinned && (
            <span style={{
              fontSize: "0.68rem", fontWeight: 700, color: "var(--accent-primary)",
              display: "flex", alignItems: "center", gap: 3,
            }}>
              📌 Pinned
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={S.postTimestamp}>{ts}{post.edited ? " (edited)" : ""}</span>
          {onTogglePin && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTogglePin(post.id); }}
              disabled={!pinned && pinDisabled}
              title={pinned ? "Unpin post" : "Pin post"}
              style={{
                background: "none", border: "none",
                cursor: (!pinned && pinDisabled) ? "not-allowed" : "pointer",
                fontSize: "0.85rem", padding: "2px 4px", lineHeight: 1,
                opacity: (!pinned && pinDisabled) ? 0.35 : 1,
                color: pinned ? "var(--accent-primary)" : "var(--text-muted)",
              }}
            >
              📌
            </button>
          )}
        </div>
      </div>
      <Link href="/dashboard" style={{ textDecoration: "none" }}>
        <p style={S.postContent}>{snippet || "(no content)"}</p>
      </Link>
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
  );
}

// ── Posts section (mobile) ────────────────────────────────────────────────────
function PostsSection({ myPosts, postCount, S, cm, pinnedPosts, onTogglePin, pinDisabled, pinError }) {
  return (
    <div style={{ ...S.card, ...cm, marginTop: 14 }}>
      <h2 style={{ color: "var(--text-primary)", fontSize: "1rem", margin: "0 0 16px 0", fontWeight: 600 }}>
        My Posts <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "0.85rem" }}>({postCount})</span>
      </h2>
      {pinError && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 10px 0" }}>{pinError}</p>}
      {myPosts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", margin: "0 0 12px 0" }}>You haven't posted anything yet.</p>
          <Link href="/dashboard" style={{ padding: "8px 18px", backgroundColor: "var(--accent-primary)", border: "none", borderRadius: "var(--radius-md)", color: "#000", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none", display: "inline-block" }}>
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {myPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              S={S}
              pinned={pinnedPosts.includes(post.id)}
              onTogglePin={onTogglePin}
              pinDisabled={pinDisabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── GitHub Roast Card ────────────────────────────────────────────────────────
function GitHubRoastCard({ githubUrl, S }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleRoast = async () => {
    if (!githubUrl) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/github-roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setResult(data);
    } catch {
      setError("Failed to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!githubUrl) return null;

  return (
    <div style={{ marginTop: 16 }}>
      {!result && (
        <button
          style={S.btnRoast}
          onClick={handleRoast}
          disabled={loading}
          className="border border-blue-400"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-primary)";
            e.currentTarget.style.color = "var(--accent-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          {loading ? "⏳ Analysing your GitHub..." : "GitHub Reality Check!"}
        </button>
      )}

      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.82rem", marginTop: 8 }}>{error}</p>
      )}

      {result && (
        <div style={S.roastCard}>
          {/* Header */}
          <div style={S.roastHeader}>
            <p style={S.roastTitle}>
              GitHub Reality Check
              <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "0.78rem" }}>
                @{result.username}
              </span>
            </p>
            <button
              style={{ ...S.btnRoast, padding: "4px 10px", fontSize: "0.75rem" }}
              onClick={() => setResult(null)}
            >
              ✕ Close
            </button>
          </div>

          {/* Stats pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            <span style={S.statPill}>📦 {result.stats.total} repos</span>
            <span style={S.statPill}>💀 {result.stats.graveyardRepos.length} graveyard</span>
            <span style={S.statPill}>📝 {result.stats.noDescription} no description</span>
            <span style={S.statPill}>🔗 {result.stats.noHomepage} no demo</span>
            <span style={S.statPill}>🍴 {result.stats.forkGraveyard} fork graveyards</span>
            {result.stats.solidRepos.length > 0 && (
              <span style={{ ...S.statPill, borderColor: "rgba(34,197,94,0.4)", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.08)" }}>
                ✅ {result.stats.solidRepos.length} solid
              </span>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--border-color)", marginBottom: 14 }} />

          {/* AI Roast text */}
          <p style={S.roastText}>{result.roast}</p>

          {/* Re-run button */}
          <button
            style={{ ...S.btnRoast, marginTop: 14, fontSize: "0.78rem", padding: "5px 12px" }}
            onClick={handleRoast}
            disabled={loading}
          >
            {loading ? "⏳ Re-analysing..." : "🔄 Re-run"}
          </button>
        </div>
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

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [linksInput, setLinksInput] = useState([]);
  const [skillsInput, setSkillsInput] = useState([]);
  const [collabInput, setCollabInput] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState(null);

  const [bio, setBio] = useState("");
  const [links, setLinks] = useState({});
  const [skills, setSkills] = useState([]);
  const [openToCollaborate, setOpenToCollaborate] = useState(false);
  const [streak, setStreak] = useState(0);

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [postCount, setPostCount] = useState(0);

  // ── Pinned posts state ──
  const [pinnedPosts, setPinnedPosts] = useState([]);
  const [pinError, setPinError] = useState("");

  // ── Delete account state ──
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);
  useEffect(() => { if (user) setCurrentPhotoURL(user.photoURL || ""); }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setBio(data.bio || "");
      const linkObj = {};
      LINK_PRESETS.forEach(({ key }) => { if (data[key]) linkObj[key] = data[key]; });
      Object.keys(data).forEach((k) => { if (k.startsWith("custom_") && !k.endsWith("_label")) linkObj[k] = data[k]; });
      setLinks(linkObj);
      setSkills(Array.isArray(data.skills) ? data.skills : []);
      setOpenToCollaborate(!!data.openToCollaborate);
      setFollowers(data.followers || []);
      setFollowing(data.following || []);
      setStreak(data.streak || 0);
      setPinnedPosts(Array.isArray(data.pinnedPosts) ? data.pinnedPosts : []);
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

  // Pinned posts float to the top, preserving relative order otherwise
  const sortedPosts = [...myPosts].sort((a, b) => {
    const aPinned = pinnedPosts.includes(a.id);
    const bPinned = pinnedPosts.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  const startEditing = () => {
    setNameInput(user.displayName || "");
    setBioInput(bio);
    setLinksInput(linksObjToArr(links));
    setSkillsInput(skills);
    setCollabInput(openToCollaborate);
    setEditing(true);
    setEditMsg(null);
  };

  const handleSaveProfile = async () => {
    if (!nameInput.trim()) { setEditMsg({ type: "error", text: "Name cannot be empty." }); return; }
    if (bioInput.length > 200) { setEditMsg({ type: "error", text: "Bio must be 200 chars or less." }); return; }
    setEditSaving(true); setEditMsg(null);
    try {
      await updateProfile(user, { displayName: nameInput.trim() });
      const cleanedLinks = {};
      LINK_PRESETS.forEach(({ key }) => { cleanedLinks[key] = ""; });
      Object.keys(links).forEach((k) => { if (k.startsWith("custom_")) cleanedLinks[k] = ""; });
      const newLinks = linksArrToObj(linksInput);
      await setDoc(doc(db, "users", user.uid), {
        displayName: nameInput.trim(),
        bio: bioInput.trim(),
        skills: skillsInput.slice(0, MAX_SKILLS),
        openToCollaborate: collabInput,
        ...cleanedLinks,
        ...newLinks,
      }, { merge: true });
      setEditMsg({ type: "success", text: "Profile updated!" });
      setTimeout(() => { setEditing(false); setEditMsg(null); }, 900);
    } catch {
      setEditMsg({ type: "error", text: "Failed to save. Try again." });
    } finally { setEditSaving(false); }
  };

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
      formData.append("public_id", `avatars/${user.uid}_${Date.now()}`);
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
    } catch (err) {
      setPhotoMsg({ type: "error", text: "Upload failed. Try again." });
    } finally { setPhotoUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const handleLogout = async () => {
    try { await logout(); router.push("/login"); }
    catch { console.error("Logout failed"); }
  };

  // ── Pin/unpin handler ─────────────────────────────────────────────────────
  const handleTogglePin = async (postId) => {
    setPinError("");
    const isPinned = pinnedPosts.includes(postId);
    if (!isPinned && pinnedPosts.length >= MAX_PINNED) {
      setPinError(`You can only pin up to ${MAX_PINNED} posts. Unpin one first.`);
      return;
    }
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { pinnedPosts: isPinned ? arrayRemove(postId) : arrayUnion(postId) },
        { merge: true }
      );
    } catch {
      setPinError("Failed to update pin. Try again.");
    }
  };

  // ── Delete account handler ────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      // 1. Delete Firestore user document
      await deleteDoc(doc(db, "users", user.uid));
      // 2. Delete Firebase Auth account
      await deleteUser(user);
      // 3. Redirect to home
      router.push("/");
    } catch (err) {
      // Firebase requires recent login for deleteUser — handle that gracefully
      if (err.code === "auth/requires-recent-login") {
        setDeleteError("For security, please log out and log back in before deleting your account.");
      } else {
        setDeleteError("Failed to delete account. Please try again.");
      }
      setDeleting(false);
    }
  };

  const cm = isMobile ? S.cardMobile : {};
  const pinDisabled = pinnedPosts.length >= MAX_PINNED;

  // ── Shared account actions block (Sign Out + Delete) ──────────────────────
  const AccountActions = () => (
    <div style={{ marginTop: isMobile ? 20 : 24, display: "flex", flexDirection: "column", gap: 0 }}>
      <button
        onClick={handleLogout}
        style={S.btnSignOut}
        onMouseEnter={(e) => { e.target.style.background = "rgba(239, 68, 68, 0.15)"; }}
        onMouseLeave={(e) => { e.target.style.background = "rgba(239, 68, 68, 0.1)"; }}
      >
        Sign Out
      </button>
      <button
        onClick={() => { setDeleteError(""); setShowDeleteModal(true); }}
        style={S.btnDeleteAccount}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(239, 68, 68, 0.06)";
          e.currentTarget.style.color = "#ef4444";
          e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "rgba(239, 68, 68, 0.6)";
          e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
        }}
      >
        🗑️ Delete Account
      </button>
    </div>
  );

  return (
    <main style={S.main}>
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
                      skillsInput={skillsInput} setSkillsInput={setSkillsInput}
                      collabInput={collabInput} setCollabInput={setCollabInput}
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
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                      {openToCollaborate && <CollabBadge />}
                      <StreakBadge count={streak} />
                    </div>
                    {skills.length > 0 && (
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <SkillBadges skills={skills} />
                      </div>
                    )}
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

            {/* GitHub Reality Check — mobile standalone */}
            <div style={{ ...S.card, ...cm, marginTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <h2 style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                  GitHub Reality Check
                </h2>
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-full)", padding: "2px 7px" }}>
                  AI-powered
                </span>
              </div>
              {links.github ? (
                <GitHubRoastCard githubUrl={links.github} S={S} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
                    🐙 Add your GitHub link to get an AI roast of your repos.
                  </p>
                  <button
                    onClick={startEditing}
                    style={{ ...S.btnGhost, fontSize: "0.8rem", padding: "5px 14px", alignSelf: "flex-start" }}
                  >
                    ✏️ Add GitHub Link
                  </button>
                </div>
              )}
            </div>

            {/* Account info */}
            <div style={{ ...S.card, ...cm, marginTop: 14 }}>
              <h2 style={{ color: "var(--text-primary)", fontSize: "1rem", margin: "0 0 16px 0", fontWeight: 600 }}>Account</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><div style={S.infoLabel}>Email</div><div style={{ ...S.infoValue, wordBreak: "break-word" }}>{user.email}</div></div>
                <div style={S.divider} />
                <div><div style={S.infoLabel}>Account Status</div><div style={{ ...S.infoValue, color: "var(--accent-success)" }}>✅ Active</div></div>
              </div>
              <AccountActions />
            </div>

            <PostsSection
              myPosts={sortedPosts}
              postCount={postCount}
              S={S}
              cm={cm}
              pinnedPosts={pinnedPosts}
              onTogglePin={handleTogglePin}
              pinDisabled={pinDisabled}
              pinError={pinError}
            />
            <div style={{ height: 40 }} />
          </>
        ) : (
          <>
            {/* Desktop hero card */}
            <div style={{ ...S.card, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 28 }}>
                <AvatarWidget size={100} currentPhotoURL={currentPhotoURL} displayName={user.displayName} photoUploading={photoUploading} photoMsg={photoMsg} avatarHovered={avatarHovered} setAvatarHovered={setAvatarHovered} fileInputRef={fileInputRef} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  {editing ? (
                    <EditForm
                      nameInput={nameInput} setNameInput={setNameInput}
                      bioInput={bioInput} setBioInput={setBioInput}
                      linksInput={linksInput} setLinksInput={setLinksInput}
                      skillsInput={skillsInput} setSkillsInput={setSkillsInput}
                      collabInput={collabInput} setCollabInput={setCollabInput}
                      editSaving={editSaving} editMsg={editMsg}
                      onSave={handleSaveProfile}
                      onCancel={() => { setEditing(false); setEditMsg(null); }}
                    />
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <h1 style={{ color: "var(--text-primary)", margin: "0 0 4px 0", fontSize: "1.5rem", fontWeight: 700 }}>
                          {user.displayName || "Anonymous User"}
                        </h1>
                        {openToCollaborate && <CollabBadge />}
                        <StreakBadge count={streak} />
                      </div>
                      <p style={{ color: "var(--text-muted)", margin: "0 0 8px 0", fontSize: "0.9rem" }}>{user.email}</p>
                      {bio && (
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0 0 12px 0", lineHeight: 1.6, maxWidth: 560 }}>{bio}</p>
                      )}
                      {skills.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <SkillBadges skills={skills} />
                        </div>
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

            {/* GitHub Reality Check — standalone section */}
            <div style={{ ...S.card, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h2 style={{ color: "var(--text-primary)", fontSize: "1rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  GitHub Reality Check
                  <span style={{ fontSize: "0.72rem", fontWeight: 400, color: "var(--text-muted)", background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-full)", padding: "2px 8px" }}>
                    AI-powered
                  </span>
                </h2>
              </div>
              {links.github ? (
                <GitHubRoastCard githubUrl={links.github} S={S} />
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 0" }}>
                  <span style={{ fontSize: "2rem" }}>🐙</span>
                  <div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: "0 0 8px 0", lineHeight: 1.5 }}>
                      Add your GitHub profile link to get an AI-powered roast of your repos — what's solid, what's a graveyard, and how to fix it.
                    </p>
                    <button
                      onClick={startEditing}
                      style={{ ...S.btnGhost, fontSize: "0.8rem", padding: "5px 14px" }}
                    >
                      ✏️ Add GitHub Link
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Two-column bottom */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20, alignItems: "start" }}>
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
                    <div style={{ ...S.infoLabel, marginBottom: 8 }}>Tech Stack / Skills</div>
                    {skills.length > 0
                      ? <SkillBadges skills={skills} />
                      : <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.85rem" }}>No skills added yet.</span>}
                  </div>
                  <div style={S.divider} />
                  <div>
                    <div style={S.infoLabel}>Collaboration</div>
                    <div style={{ marginTop: 4 }}>
                      {openToCollaborate
                        ? <CollabBadge />
                        : <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.85rem" }}>Not open to collaboration.</span>}
                    </div>
                  </div>
                  <div style={S.divider} />
                  <div>
                    <div style={{ ...S.infoLabel, marginBottom: 8 }}>Activity Streak</div>
                    <div style={{ marginTop: 4 }}>
                      {streak > 0
                        ? <StreakBadge count={streak} />
                        : <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.85rem" }}>No streak yet — post or comment to start one!</span>}
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
                <AccountActions />
              </div>

              <div style={{ ...S.card, height: "100%", boxSizing: "border-box" }}>
                <h2 style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0 0 18px 0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>My Posts</span>
                  <span style={{ color: "var(--accent-primary)", fontWeight: 700, fontSize: "1rem", textTransform: "none", letterSpacing: 0 }}>{postCount}</span>
                </h2>
                {pinError && <p style={{ color: "#ef4444", fontSize: "0.78rem", margin: "0 0 12px 0" }}>{pinError}</p>}
                {myPosts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "0 0 14px 0" }}>You haven't posted anything yet.</p>
                    <Link href="/dashboard" style={{ ...S.btnPrimary, textDecoration: "none", display: "inline-block" }}>Go to Dashboard</Link>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 520, overflowY: "auto" }}>
                    {sortedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        S={S}
                        pinned={pinnedPosts.includes(post.id)}
                        onTogglePin={handleTogglePin}
                        pinDisabled={pinDisabled}
                      />
                    ))}
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

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccount}
          onClose={() => { if (!deleting) { setShowDeleteModal(false); setDeleteError(""); } }}
          deleting={deleting}
          deleteError={deleteError}
        />
      )}
    </main>
  );
}