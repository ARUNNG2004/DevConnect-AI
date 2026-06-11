"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";

const S = {
  // ── Landing navbar ──────────────────────────────────────────────────────────
  landingNav: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 100,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 8%",
    background: "var(--bg-secondary)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: "1px solid var(--border-color)",
    transition: "all var(--transition-fast)",
  },
  logo: {
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  },
  logoIcon: {
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
    color: "#000",
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
    fontWeight: 900,
    borderRadius: "var(--radius-sm)",
    boxShadow: "0 0 15px rgba(56, 189, 248, 0.3)",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  navLink: {
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.95rem",
    transition: "color var(--transition-fast)",
    padding: "6px 12px",
    cursor: "pointer",
  },
  btnNavCta: {
    display: "inline-block",
    padding: "10px 20px",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
    color: "#000",
    fontWeight: 600,
    borderRadius: "var(--radius-sm)",
    boxShadow: "0 4px 15px rgba(56, 189, 248, 0.2)",
    textDecoration: "none",
    cursor: "pointer",
    border: "none",
    transition: "transform var(--transition-fast)",
  },
  themeToggleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    background: "var(--bg-primary)",
    border: "1.5px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    fontSize: "1.2rem",
    fontWeight: 600,
  },

  // ── Dashboard navbar ─────────────────────────────────────────────────────────
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    padding: "0 24px",
    backgroundColor: "var(--bg-secondary)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--border-color)",
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 700,
    fontSize: "1.25rem",
    color: "var(--text-primary)",
    textDecoration: "none",
  },
  navSearch: {
    position: "relative",
    width: "100%",
    maxWidth: 420,
    margin: "0 16px",
  },
  navSearchInput: {
    width: "100%",
    padding: "8px 16px 8px 40px",
    backgroundColor: "var(--bg-tertiary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-full)",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "0.9rem",
    transition: "all var(--transition-fast)",
  },
  navSearchIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
    pointerEvents: "none",
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  btnIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    background: "transparent",
    border: "1.5px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    fontSize: "1rem",
  },
  userProfileMenu: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    textDecoration: "none",
  },
  avatar: {
    position: "relative",
    width: 36,
    height: 36,
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
    borderRadius: "var(--radius-full)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    fontWeight: 700,
    fontSize: "0.9rem",
    border: "2px solid var(--border-color)",
  },
};

export default function Navbar({ variant = "landing" }) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // ─── Landing Page Navbar ────────────────────────────────────────────────────
  if (variant === "landing") {
    return (
      <nav style={S.landingNav}>
        <Link href="/" style={S.logo}>
          <div style={S.logoIcon}>🧠</div>
          <span>DevConnect AI</span>
        </Link>

        <div style={S.navLinks}>
          <a href="#features" style={S.navLink}>AI Showcase</a>
          <a href="#workflow" style={S.navLink}>How It Works</a>
          <a href="#stats" style={S.navLink}>Dashboard</a>
          <a href="#waitlist" style={S.navLink}>Waitlist</a>

          {user ? (
            <>
              <Link href="/dashboard" style={S.btnNavCta}>
                Open Community App
              </Link>
              <Link
                href="/profile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                }}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "var(--radius-full)",
                      border: "2px solid var(--border-color)",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "var(--radius-full)",
                      background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#000",
                    }}
                  >
                    {user.displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <span>{user.displayName?.split(" ")[0]}</span>
              </Link>
            </>
          ) : (
            <Link href="/login" style={S.btnNavCta}>
              Sign In
            </Link>
          )}

          <button
            onClick={toggleTheme}
            style={S.themeToggleBtn}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--accent-primary-alpha)";
              e.currentTarget.style.borderColor = "var(--accent-primary)";
              e.currentTarget.style.color = "var(--accent-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-primary)";
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>
    );
  }

  // ─── Dashboard / App Navbar ─────────────────────────────────────────────────
  return (
    <header style={S.navbar}>
      <Link href="/" style={S.navBrand} title="Back to Home">
        <span>🧠 DevConnect AI</span>
      </Link>

      <div style={S.navSearch}>
        <span style={S.navSearchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search discussions, tags, error codes..."
          style={S.navSearchInput}
        />
      </div>

      <div style={S.navActions}>
        <button style={S.btnIcon} title="AI Code Review Alerts">✨</button>
        <button style={S.btnIcon} title="Notifications">🔔</button>

        <button
          onClick={toggleTheme}
          style={S.btnIcon}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent-primary-alpha)";
            e.currentTarget.style.borderColor = "var(--accent-primary)";
            e.currentTarget.style.color = "var(--accent-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = "var(--border-color)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/profile" style={S.userProfileMenu} title="View Profile">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-full)",
                    border: "2px solid var(--border-color)",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div style={S.avatar}>
                  {user.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
                {user.displayName?.split(" ")[0] || "Profile"}
              </span>
            </Link>

            <button onClick={handleLogout} style={{ ...S.btnIcon, fontSize: "1rem" }} title="Logout">
              🚪
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              padding: "8px 16px",
              background: "var(--accent-primary)",
              color: "#000",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              fontSize: "0.9rem",
              textDecoration: "none",
              cursor: "pointer",
              border: "none",
            }}
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
