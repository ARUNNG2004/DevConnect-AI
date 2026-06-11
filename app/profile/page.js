"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

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
    textAlign: "center",
    boxShadow: "var(--shadow-sm)",
  },
  avatarLarge: {
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
    flexShrink: 0,
    margin: "0 auto",
  },
  divider: { borderTop: "1px solid var(--border-color)" },
  infoRow: { display: "flex", alignItems: "center", gap: 12 },
  infoLabel: { color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: 2, margin: "0 0 2px 0" },
  infoValue: { color: "var(--text-primary)", fontSize: "0.95rem", margin: 0 },
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
};

export default function Profile() {
  const { user, logout, loading } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
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
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";

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
              transition: "all var(--transition-fast)",
              fontSize: "1.2rem",
            }}
            title="Toggle theme"
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
          <Link href="/dashboard" style={S.btnNavBack}>← Dashboard</Link>
          <button onClick={handleLogout} style={S.btnLogout} title="Logout">
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={S.container}>
        {/* Profile Card */}
        <div style={S.cardSmall}>
          <div style={S.avatarLarge}>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "var(--radius-full)",
                  objectFit: "cover",
                }}
              />
            ) : (
              user.displayName?.charAt(0).toUpperCase() || "U"
            )}
          </div>

          <h1 style={{ color: "var(--text-primary)", marginTop: 16, marginBottom: 4 }}>
            {user.displayName || "Anonymous User"}
          </h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            {user.email}
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
          <div style={S.cardSmall}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 8 }}>Posts</div>
            <div style={{ color: "var(--accent-primary)", fontSize: "2rem", fontWeight: 700 }}>0</div>
          </div>
          <div style={S.cardSmall}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 8 }}>Joined</div>
            <div style={{ color: "var(--text-primary)", fontSize: "0.95rem", fontWeight: 600 }}>{joinedDate}</div>
          </div>
        </div>

        {/* Account Info */}
        <div style={S.cardSmall}>
          <h2 style={{ color: "var(--text-primary)", fontSize: "1.1rem", marginBottom: 16 }}>Account Information</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={S.infoLabel}>Email Address</div>
              <div style={S.infoValue}>{user.email}</div>
            </div>

            <div style={S.divider} />

            <div>
              <div style={S.infoLabel}>Display Name</div>
              <div style={S.infoValue}>{user.displayName || "Not set"}</div>
            </div>

            <div style={S.divider} />

            <div>
              <div style={S.infoLabel}>Account Status</div>
              <div style={{ ...S.infoValue, color: "var(--accent-success)" }}>Active</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{ ...S.btnSignOut, marginTop: 20 }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(239, 68, 68, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(239, 68, 68, 0.1)";
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}
