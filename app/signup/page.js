"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useTheme } from "../../context/ThemeContext";
import Link from "next/link";
import { Sparkles, Mail, KeyRound, User, Sun, Moon } from "lucide-react";
import { useResponsive } from "../../hooks/useResponsive";

export default function Signup() {
  const { signupWithEmail, loginWithGoogle, loginWithGithub, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const { isMobile } = useResponsive();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signupWithEmail(email, password, fullName);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to sign up with Google.");
    }
  };

  const handleGithubLogin = async () => {
    try {
      await loginWithGithub();
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to sign up with GitHub.");
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    background: "var(--bg-primary)",
    padding: isMobile ? "16px 12px" : "12px 16px",
  };

  const glowStyle = {
    position: "absolute",
    borderRadius: "50%",
    pointerEvents: "none",
    filter: "blur(120px)",
  };

  const cardStyle = {
    maxWidth: "28rem",
    width: "100%",
    padding: isMobile ? "1.75rem 1.25rem" : "2.5rem",
    background: "var(--bg-secondary)",
    backdropFilter: "blur(12px)",
    borderRadius: "1.5rem",
    boxShadow: "0 20px 25px rgba(0, 0, 0, 0.2)",
    border: "1px solid var(--border-color)",
    position: "relative",
    zIndex: 10,
    boxSizing: "border-box",
  };

  const themeToggleContainerStyle = {
    position: "absolute",
    top: "1.25rem",
    right: "1.25rem",
    zIndex: 20,
  };

  const themeButtonStyle = {
    background: "var(--bg-tertiary)",
    border: "1px solid var(--border-color)",
    borderRadius: "50%",
    width: "2.5rem",
    height: "2.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "var(--text-primary)",
    transition: "all var(--transition-fast)",
  };

  const brandHeaderStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const brandIconStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "3.5rem",
    height: "3.5rem",
    borderRadius: "0.625rem",
    background: "linear-gradient(to bottom right, #a855f7, #ec4899)",
    boxShadow: "0 0 20px rgba(168, 85, 247, 0.3)",
    marginBottom: "1rem",
  };

  const titleStyle = {
    marginTop: "0.5rem",
    textAlign: "center",
    fontSize: "1.875rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-0.025em",
  };

  const subtitleStyle = {
    marginTop: "0.75rem",
    textAlign: "center",
    fontSize: "0.875rem",
    color: "var(--text-muted)",
  };

  const errorStyle = {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#ef4444",
    fontSize: "0.875rem",
    padding: "1rem",
    borderRadius: "0.75rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginTop: "1.5rem",
  };

  const formStyle = {
    marginTop: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  };

  const inputGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const relativeStyle = {
    position: "relative",
  };

  const inputIconStyle = {
    position: "absolute",
    inset: 0,
    paddingLeft: "0.75rem",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  };

  const inputStyle = {
    appearance: "none",
    position: "relative",
    display: "block",
    width: "100%",
    paddingLeft: "2.5rem",
    paddingRight: "0.75rem",
    paddingTop: "0.875rem",
    paddingBottom: "0.875rem",
    border: "1px solid var(--border-color)",
    background: "var(--bg-tertiary)",
    color: "var(--text-primary)",
    borderRadius: "0.75rem",
    outline: "none",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    transition: "all var(--transition-fast)",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    position: "relative",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    paddingTop: "0.875rem",
    paddingBottom: "0.875rem",
    paddingLeft: "1rem",
    paddingRight: "1rem",
    border: "none",
    fontSize: "0.875rem",
    fontWeight: 700,
    borderRadius: "0.75rem",
    color: "#000",
    background: "var(--accent-primary)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
  };

  const dividerStyle = {
    position: "relative",
    marginTop: "2rem",
  };

  const dividerLineStyle = {
    display: "flex",
    alignItems: "center",
  };

  const dividerLineInnerStyle = {
    flex: 1,
    borderTop: "1px solid var(--border-color)",
  };

  const dividerTextStyle = {
    paddingLeft: "1rem",
    paddingRight: "1rem",
    background: "var(--bg-secondary)",
    color: "var(--text-muted)",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: 600,
  };

  const gridStyle = {
    marginTop: "1.5rem",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  };

  const socialButtonStyle = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    paddingTop: "0.625rem",
    paddingBottom: "0.625rem",
    paddingLeft: "1rem",
    paddingRight: "1rem",
    border: "1px solid var(--border-color)",
    borderRadius: "0.75rem",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    background: "var(--bg-tertiary)",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--text-primary)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
  };

  const footerStyle = {
    marginTop: "1.5rem",
    paddingTop: "1rem",
    borderTop: "1px solid var(--border-color)",
    textAlign: "center",
  };

  const footerTextStyle = {
    fontSize: "0.875rem",
    color: "var(--text-muted)",
  };

  const footerLinkStyle = {
    fontWeight: 600,
    color: "var(--accent-primary)",
    textDecoration: "none",
    transition: "color var(--transition-fast)",
  };

  return (
    <main style={containerStyle}>
      {/* Background Glow Effects */}
      <div
        style={{
          ...glowStyle,
          top: "-10%",
          left: "-10%",
          width: "40%",
          height: "40%",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.2), transparent 80%)",
        }}
      />
      <div
        style={{
          ...glowStyle,
          bottom: "-10%",
          right: "-10%",
          width: "40%",
          height: "40%",
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.2), transparent 80%)",
        }}
      />

      <div style={cardStyle}>
        {/* Theme Toggle */}
        <div style={themeToggleContainerStyle}>
          <button
            type="button"
            onClick={toggleTheme}
            style={themeButtonStyle}
            aria-label="Toggle theme"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-tertiary)";
            }}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Brand Header */}
        <div style={brandHeaderStyle}>
          <div style={brandIconStyle}>
            <span style={{ fontSize: "1.5rem" }}>🧠</span>
          </div>
          <h2 style={titleStyle}>Create an account</h2>
          <p style={subtitleStyle}>
            Join the future of{" "}
            <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>
              Developer Collaboration
            </span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={errorStyle}>
            <span style={{ color: "#ef4444" }}>⚠</span> {error}
          </div>
        )}

        {/* Signup Form */}
        <form style={formStyle} onSubmit={handleEmailSignup}>
          <div style={inputGroupStyle}>

            {/* Full Name */}
            <div style={relativeStyle}>
              <label htmlFor="full-name" style={{ display: "none" }}>Full Name</label>
              <div style={{ ...inputIconStyle, color: "var(--text-muted)" }}>
                <User size={20} />
              </div>
              <input
                id="full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                style={inputStyle}
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--border-focus)";
                  e.target.style.background = "var(--bg-primary)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-color)";
                  e.target.style.background = "var(--bg-tertiary)";
                }}
              />
            </div>

            {/* Email */}
            <div style={relativeStyle}>
              <label htmlFor="email-address" style={{ display: "none" }}>Email address</label>
              <div style={{ ...inputIconStyle, color: "var(--text-muted)" }}>
                <Mail size={20} />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                style={inputStyle}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--border-focus)";
                  e.target.style.background = "var(--bg-primary)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-color)";
                  e.target.style.background = "var(--bg-tertiary)";
                }}
              />
            </div>

            {/* Password */}
            <div style={relativeStyle}>
              <label htmlFor="password" style={{ display: "none" }}>Password</label>
              <div style={{ ...inputIconStyle, color: "var(--text-muted)" }}>
                <KeyRound size={20} />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                style={inputStyle}
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--border-focus)";
                  e.target.style.background = "var(--bg-primary)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border-color)";
                  e.target.style.background = "var(--bg-tertiary)";
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              "Creating account..."
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Sign Up <Sparkles size={16} />
              </span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={dividerStyle}>
          <div style={dividerLineStyle}>
            <div style={dividerLineInnerStyle} />
            <div style={dividerTextStyle}>Or register with</div>
            <div style={dividerLineInnerStyle} />
          </div>
        </div>

        {/* Social Buttons */}
        <div style={gridStyle}>
          <button
            onClick={handleGoogleLogin}
            style={socialButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-primary-alpha)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-tertiary)";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>

          <button
            onClick={handleGithubLogin}
            style={socialButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-primary-alpha)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-tertiary)";
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.467-1.334-5.467-5.93 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.603-.015 2.898-.015 3.291 0 .321.217.695.825.577C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub
          </button>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <p style={footerTextStyle}>
            Already have an account?{" "}
            <Link href="/login" style={footerLinkStyle}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}