"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Mail, Shield, CheckCircle, Fingerprint, LogOut, FileText } from "lucide-react";

const BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

export default function Profile() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!BYPASS_AUTH && !loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (!BYPASS_AUTH && loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFDF9" }}>
        <p style={{ color: "#6b7280", fontWeight: 600 }}>Loading...</p>
      </div>
    );
  }

  if (!BYPASS_AUTH && !user) return null;

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
    <main id="app-dashboard-view" style={{ minHeight: "100vh" }}>
      <header className="dashboard-nav">
        <Link href="/dashboard" className="nav-brand">
          <span>DevConnect AI</span>
        </Link>
        <div className="nav-actions">
          <Link
            href="/dashboard"
            className="btn-sidebar-cta"
            style={{ padding: "8px 20px", fontSize: "0.85rem", display: "inline-flex", textDecoration: "none" }}
          >
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="btn-icon"
            title="Logout"
            style={{ width: "auto", padding: "0 14px", gap: 6, display: "flex", alignItems: "center", fontSize: "0.85rem", fontWeight: 600 }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px" }}>
        <div className="composer-card" style={{ padding: 32, gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {user.photoURL ? (
              <div className="author-avatar" style={{ width: 80, height: 80, overflow: "hidden", borderRadius: "12px !important" }}>
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 0 }}
                />
              </div>
            ) : (
              <div className="author-avatar" style={{
                width: 80,
                height: 80,
                fontSize: "2rem",
                background: "linear-gradient(135deg, #00875A, #E07A1B)"
              }}>
                {user.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <h1 style={{
                color: "#111111",
                fontSize: "1.6rem",
                fontWeight: 700,
                marginBottom: 4,
                fontFamily: "'Oswald', sans-serif",
                textTransform: "uppercase"
              }}>
                {user.displayName || "Anonymous Developer"}
              </h1>
              <p style={{ color: "#6b7280", fontSize: "0.9rem", fontWeight: 500 }}>
                Joined {joinedDate}
              </p>
            </div>
          </div>

          <div style={{ borderTop: "2px solid #000000" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Mail size={20} style={{ color: "#4b5563", flexShrink: 0 }} />
              <div>
                <p style={{ color: "#6b7280", fontSize: "0.75rem", marginBottom: 2, fontWeight: 600 }}>Email</p>
                <p style={{ color: "#111111", fontSize: "0.95rem", fontWeight: 500 }}>{user.email}</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Shield size={20} style={{ color: "#4b5563", flexShrink: 0 }} />
              <div>
                <p style={{ color: "#6b7280", fontSize: "0.75rem", marginBottom: 2, fontWeight: 600 }}>Sign-in Provider</p>
                <p style={{ color: "#111111", fontSize: "0.95rem", fontWeight: 500, textTransform: "capitalize" }}>
                  {user.providerData?.[0]?.providerId?.replace(".com", "") || "Unknown"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <CheckCircle size={20} style={{ color: user.emailVerified ? "#00875A" : "#E07A1B", flexShrink: 0 }} />
              <div>
                <p style={{ color: "#6b7280", fontSize: "0.75rem", marginBottom: 2, fontWeight: 600 }}>Email Verified</p>
                <p style={{
                  color: user.emailVerified ? "#00875A" : "#E07A1B",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                }}>
                  {user.emailVerified ? "Verified" : "Not Verified"}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Fingerprint size={20} style={{ color: "#4b5563", flexShrink: 0 }} />
              <div>
                <p style={{ color: "#6b7280", fontSize: "0.75rem", marginBottom: 2, fontWeight: 600 }}>User ID</p>
                <p style={{
                  color: "#4b5563",
                  fontSize: "0.8rem",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 500,
                  wordBreak: "break-all",
                }}>
                  {user.uid}
                </p>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "2px solid #000000" }} />

          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "12px",
              background: "#ef4444",
              border: "2.5px solid #000000",
              borderRadius: "12px",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "4px 4px 0px #000000",
              transition: "all 0.1s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseEnter={e => { e.target.style.transform = "translate(-2px, -2px)"; e.target.style.boxShadow = "6px 6px 0px #000000"; }}
            onMouseLeave={e => { e.target.style.transform = ""; e.target.style.boxShadow = ""; }}
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        <div className="composer-card" style={{ padding: 24, marginTop: 20, textAlign: "center" }}>
          <FileText size={24} style={{ color: "#6b7280", marginBottom: 8, display: "inline-block" }} />
          <p style={{ color: "#6b7280", fontSize: "0.9rem", fontWeight: 500 }}>
            Your posts, saved items, and activity will appear here soon.
          </p>
        </div>
      </div>
    </main>
  );
}
