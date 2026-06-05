"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function Profile() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

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

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>

      {/* Navbar */}
      <header className="navbar">
        <Link href="/dashboard" className="nav-brand">
          <span>🧠 DevConnect AI</span>
        </Link>
        <div className="nav-actions">
          <Link href="/dashboard" style={{
            padding: "8px 16px",
            background: "var(--accent-primary-alpha)",
            color: "var(--accent-primary)",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            fontSize: "0.9rem",
            textDecoration: "none",
          }}>
            ← Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="btn-icon"
            title="Logout"
            style={{ width: "auto", padding: "0 14px", gap: 6, display: "flex", alignItems: "center" }}
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Profile Content */}
      <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px" }}>

        {/* Profile Card */}
        <div className="composer-card" style={{ padding: 32, gap: 24 }}>

          {/* Avatar + Name */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "var(--radius-full)",
                  border: "3px solid var(--border-color)",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div style={{
                width: 80,
                height: 80,
                borderRadius: "var(--radius-full)",
                background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "#000",
                border: "3px solid var(--border-color)",
              }}>
                {user.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <h1 style={{
                color: "var(--text-primary)",
                fontSize: "1.6rem",
                fontWeight: 700,
                marginBottom: 4,
              }}>
                {user.displayName || "Anonymous Developer"}
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Joined {joinedDate}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--border-color)" }} />

          {/* Info Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "1.1rem" }}>📧</span>
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: 2 }}>Email</p>
                <p style={{ color: "var(--text-primary)", fontSize: "0.95rem" }}>{user.email}</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "1.1rem" }}>🔐</span>
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: 2 }}>Sign-in Provider</p>
                <p style={{ color: "var(--text-primary)", fontSize: "0.95rem", textTransform: "capitalize" }}>
                  {user.providerData?.[0]?.providerId?.replace(".com", "") || "Unknown"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "1.1rem" }}>✅</span>
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: 2 }}>Email Verified</p>
                <p style={{
                  color: user.emailVerified ? "var(--accent-success)" : "var(--accent-warning)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                }}>
                  {user.emailVerified ? "Verified" : "Not Verified"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "1.1rem" }}>🪪</span>
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: 2 }}>User ID</p>
                <p style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  fontFamily: "var(--font-mono)",
                  wordBreak: "break-all",
                }}>
                  {user.uid}
                </p>
              </div>
            </div>

          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid var(--border-color)" }} />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "var(--radius-md)",
              color: "#ef4444",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => e.target.style.background = "rgba(239, 68, 68, 0.2)"}
            onMouseLeave={e => e.target.style.background = "rgba(239, 68, 68, 0.1)"}
          >
            🚪 Sign Out
          </button>

        </div>

        {/* Coming Soon Card */}
        <div className="composer-card" style={{ padding: 24, marginTop: 20, textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            📝 Your posts, saved items, and activity will appear here soon.
          </p>
        </div>

      </div>
    </main>
  );
}