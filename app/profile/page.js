"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { db } from "../../lib/firebase";
import { collection, query, where, onSnapshot, setDoc, doc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

const S = {
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    background: "var(--bg-secondary)",
    borderBottom: "1px solid var(--border-color)",
    zIndex: 100,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
  },
  navBrand: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  btnNavBack: {
    padding: "8px 16px",
    background: "transparent",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)",
    fontWeight: 500,
    cursor: "pointer",
    textDecoration: "none",
    transition: "all var(--transition-fast)",
  },
  btnLogout: {
    padding: "8px 16px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "var(--radius-md)",
    color: "#ef4444",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all var(--transition-fast)",
  },
  main: {
    minHeight: "100vh",
    background: "var(--bg-primary)",
    paddingTop: 64,
  },
  container: {
    maxWidth: "45rem",
    margin: "40px auto",
    padding: "0 24px",
  },
  cardSmall: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 24,
    marginTop: 20,
    boxShadow: "var(--shadow-sm)",
  },
  profileCardInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  avatarWrap: {
    position: "relative",
    width: 90,
    height: 90,
    cursor: "pointer",
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: "var(--radius-full)",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: 700,
    color: "#000",
    border: "3px solid var(--border-color)",
    overflow: "hidden",
  },
  avatarOverlay: {
    position: "absolute",
    inset: 0,
    borderRadius: "var(--radius-full)",
    backgroundColor: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.4rem",
    opacity: 0,
    transition: "opacity 0.2s",
  },
  changePhotoBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: "var(--radius-full)",
    backgroundColor: "var(--accent-primary)",
    border: "2px solid var(--bg-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    cursor: "pointer",
    zIndex: 2,
  },
  divider: { borderTop: "1px solid var(--border-color)" },
  infoLabel: {
    color: "var(--text-muted)",
    fontSize: "0.75rem",
    margin: "0 0 2px 0",
  },
  infoValue: { color: "var(--text-primary)", fontSize: "0.95rem", margin: 0 },
  input: {
    width: "100%",
    padding: "8px 12px",
    background: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },
  btnPrimary: {
    padding: "8px 20px",
    backgroundColor: "var(--accent-primary)",
    border: "none",
    borderRadius: "var(--radius-md)",
    color: "#000",
    fontWeight: 600,
    fontSize: "0.85rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnGhost: {
    padding: "8px 20px",
    backgroundColor: "transparent",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)",
    fontWeight: 500,
    fontSize: "0.85rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnSignOut: {
    width: "100%",
    padding: 12,
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "var(--radius-md)",
    color: "#ef4444",
    fontWeight: 600,
    fontSize: "0.95rem",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all var(--transition-fast)",
  },
  successMsg: {
    color: "var(--accent-success)",
    fontSize: "0.85rem",
    margin: "8px 0 0 0",
    textAlign: "center",
  },
  errorMsg: {
    color: "#ef4444",
    fontSize: "0.85rem",
    margin: "8px 0 0 0",
    textAlign: "center",
  },
};

export default function Profile() {
  const { user, logout, loading } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();

  const [postCount, setPostCount] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoMsg, setPhotoMsg] = useState(null);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [currentPhotoURL, setCurrentPhotoURL] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) setCurrentPhotoURL(user.photoURL || "");
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "posts"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => setPostCount(snap.size));
    return () => unsub();
  }, [user]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const joinedDate = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  const startEditName = () => {
    setNameInput(user.displayName || "");
    setEditingName(true);
    setNameMsg(null);
  };

  const cancelEditName = () => {
    setEditingName(false);
    setNameMsg(null);
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setNameSaving(true);
    setNameMsg(null);
    try {
      await updateProfile(user, { displayName: nameInput.trim() });
      // ── KEY: write to users/{uid} so the dashboard usersCache picks it up instantly ──
      await setDoc(
        doc(db, "users", user.uid),
        { displayName: nameInput.trim() },
        { merge: true }
      );
      setNameMsg({ type: "success", text: "Name updated successfully!" });
      setEditingName(false);
    } catch (err) {
      console.error(err);
      setNameMsg({ type: "error", text: "Failed to update name. Try again." });
    } finally {
      setNameSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoMsg({ type: "error", text: "Please select an image file." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoMsg({ type: "error", text: "Image must be under 5MB." });
      return;
    }

    setPhotoUploading(true);
    setPhotoMsg(null);

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
      // ── KEY: write to users/{uid} so dashboard live-cache updates all posts ──
      await setDoc(doc(db, "users", user.uid), { photoURL }, { merge: true });

      setCurrentPhotoURL(photoURL);
      setPhotoMsg({ type: "success", text: "Photo updated! All your posts now show the new photo." });
    } catch (err) {
      console.error(err);
      setPhotoMsg({ type: "error", text: "Upload failed. Try again." });
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <main style={S.main}>
      {/* Navbar */}
      <header style={S.navbar}>
        <Link href="/dashboard" style={S.navBrand}>
          <span>🧠 DevConnect AI</span>
        </Link>
        <div style={S.navActions}>
          <button
            onClick={toggleTheme}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              background: "transparent",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-full)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
            title="Toggle theme"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <Link href="/dashboard" style={S.btnNavBack}>← Dashboard</Link>
          <button onClick={handleLogout} style={S.btnLogout}>🚪 Logout</button>
        </div>
      </header>

      <div style={S.container}>

        {/* ── Profile Card ───────────────────────────────────────────── */}
        <div style={S.cardSmall}>
          <div style={S.profileCardInner}>

            {/* Avatar — click anywhere on it to change photo */}
            <div
              style={S.avatarWrap}
              onMouseEnter={() => setAvatarHovered(true)}
              onMouseLeave={() => setAvatarHovered(false)}
              onClick={() => !photoUploading && fileInputRef.current?.click()}
              title="Click to change photo"
            >
              <div style={S.avatarLarge}>
                {currentPhotoURL ? (
                  <img
                    src={currentPhotoURL}
                    alt={user.displayName || "Avatar"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  user.displayName?.charAt(0).toUpperCase() || "U"
                )}
              </div>

              {/* Hover overlay */}
              <div style={{ ...S.avatarOverlay, opacity: avatarHovered ? 1 : 0 }}>
                {photoUploading ? "⏳" : "📷"}
              </div>

              {/* Always-visible camera badge bottom-right */}
              <div style={S.changePhotoBadge} title="Change photo">
                {photoUploading ? "⏳" : "📷"}
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />

            {photoMsg && (
              <p style={photoMsg.type === "success" ? S.successMsg : S.errorMsg}>
                {photoMsg.text}
              </p>
            )}

            <div style={{ textAlign: "center" }}>
              <h1 style={{ color: "var(--text-primary)", margin: "0 0 4px 0", fontSize: "1.4rem" }}>
                {user.displayName || "Anonymous User"}
              </h1>
              <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem" }}>
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats Cards ────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
          <div style={{ ...S.cardSmall, textAlign: "center", marginTop: 0 }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 8 }}>Posts</div>
            <div style={{ color: "var(--accent-primary)", fontSize: "2rem", fontWeight: 700 }}>
              {postCount}
            </div>
          </div>
          <div style={{ ...S.cardSmall, textAlign: "center", marginTop: 0 }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 8 }}>Joined</div>
            <div style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 600 }}>
              {joinedDate}
            </div>
          </div>
        </div>

        {/* ── Account Info ───────────────────────────────────────────── */}
        <div style={{ ...S.cardSmall, textAlign: "left" }}>
          <h2 style={{ color: "var(--text-primary)", fontSize: "1.1rem", margin: "0 0 16px 0" }}>
            Account Information
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Email */}
            <div>
              <div style={S.infoLabel}>Email Address</div>
              <div style={S.infoValue}>{user.email}</div>
            </div>

            <div style={S.divider} />

            {/* Display Name */}
            <div>
              <div style={S.infoLabel}>Display Name</div>
              {editingName ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                  <input
                    style={S.input}
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") cancelEditName();
                    }}
                    autoFocus
                    placeholder="Enter display name"
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      style={S.btnPrimary}
                      onClick={handleSaveName}
                      disabled={nameSaving || !nameInput.trim()}
                    >
                      {nameSaving ? "Saving..." : "Save"}
                    </button>
                    <button style={S.btnGhost} onClick={cancelEditName}>Cancel</button>
                  </div>
                  {nameMsg && (
                    <p style={nameMsg.type === "success" ? S.successMsg : S.errorMsg}>
                      {nameMsg.text}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                  <div style={S.infoValue}>{user.displayName || "Not set"}</div>
                  <button style={S.btnGhost} onClick={startEditName}>✏️ Edit</button>
                </div>
              )}
            </div>

            <div style={S.divider} />

            {/* Account Status */}
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
          >
            Sign Out
          </button>
        </div>

      </div>
    </main>
  );
}