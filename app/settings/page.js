"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Settings as SettingsIcon } from "lucide-react";

const BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

export default function Settings() {
  const { user, loading } = useAuth();
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
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px" }}>
        <div className="composer-card" style={{ padding: 40, textAlign: "center", alignItems: "center" }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#ffffff",
            border: "3px solid #000000",
            boxShadow: "4px 4px 0px #000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16
          }}>
            <SettingsIcon size={36} style={{ color: "#111111" }} />
          </div>
          <h1 style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: "2.5rem",
            textTransform: "uppercase",
            fontWeight: 900,
            color: "#111111",
            marginBottom: 8
          }}>
            Settings
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem", fontWeight: 500, marginBottom: 24 }}>
            Account preferences and configuration coming soon.
          </p>
          <Link
            href="/dashboard"
            className="btn-brutalist-primary"
            style={{ textDecoration: "none", display: "inline-flex" }}
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
