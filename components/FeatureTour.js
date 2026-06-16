"use client";

import { useState, useEffect, useLayoutEffect } from "react";

const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    zIndex: 1100,
  },
  highlight: {
    position: "fixed",
    border: "2px solid var(--accent-primary)",
    borderRadius: "var(--radius-md)",
    boxShadow: "0 0 0 4px rgba(56,189,248,0.25), 0 0 0 9999px rgba(0,0,0,0.55)",
    zIndex: 1101,
    pointerEvents: "none",
    transition: "all 0.25s ease",
  },
  card: {
    position: "fixed",
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    width: "100%",
    maxWidth: 360,
    padding: 24,
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    zIndex: 1102,
    transition: "all 0.25s ease",
  },
  cardCentered: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    width: "100%",
    maxWidth: 420,
    padding: 28,
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    zIndex: 1102,
  },
  iconWrap: { fontSize: "2rem", lineHeight: 1 },
  title: { fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 },
  desc: { fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.55, margin: 0 },
  progressRow: { display: "flex", gap: 6, marginTop: 4 },
  dot: { height: 6, flex: 1, borderRadius: "var(--radius-full)", backgroundColor: "var(--border-color)", transition: "background-color 0.2s" },
  dotActive: { height: 6, flex: 1, borderRadius: "var(--radius-full)", backgroundColor: "var(--accent-primary)", transition: "background-color 0.2s" },
  footer: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  skipBtn: { background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500, padding: "8px 4px" },
  navGroup: { display: "flex", gap: 8 },
  backBtn: { padding: "8px 16px", backgroundColor: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" },
  nextBtn: { padding: "8px 20px", backgroundColor: "var(--accent-primary)", border: "none", borderRadius: "var(--radius-md)", color: "#000", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" },
};

// Steps describing each major feature of the dashboard.
// `targetId` should match the `id` attribute of the real DOM element to highlight.
// `placement` controls where the tooltip card appears relative to the target.
const STEPS = [
  {
    icon: "✍️",
    title: "Create a Discussion",
    desc: "Use the composer at the top of your feed to share a coding question, project idea, or debugging help.",
    targetId: "composer-card",
    placement: "bottom",
  },
  {
    icon: "🏷️",
    title: "Tag Your Posts",
    desc: "Pick from common tags like #react, #python, or #devops, or type your own custom tag and hit + Add.",
    targetId: "composer-tags",
    placement: "bottom",
  },
  {
    icon: "🤖",
    title: "AI Draft Assistant",
    desc: "Flip this switch to get AI-generated help writing your post.",
    targetId: "ai-draft-toggle",
    placement: "top",
  },
  {
    icon: "</>",
    title: "Insert Code Blocks",
    desc: "Click this icon to open the code editor modal and insert a snippet with syntax highlighting.",
    targetId: "open-code-editor-btn",
    placement: "top",
  },
  {
    icon: "❤️",
    title: "Like & Comment",
    desc: "React to posts with a like, and open the comments panel to join the discussion.",
    targetId: "post-actions-0",
    placement: "top",
  },
  {
    icon: "🔖",
    title: "Save Posts for Later",
    desc: "Click 'Save' on any post to bookmark it. Open 'Saved Posts' from the left sidebar to revisit them.",
    targetId: "saved-posts-nav",
    placement: "right",
  },
  {
    icon: "📈",
    title: "Trending Tags",
    desc: "The right sidebar shows the top tags across the community, computed live from real posts.",
    targetId: "trending-tags-widget",
    placement: "left",
  },
  {
    icon: "🛠️",
    title: "Code Review Copilot",
    desc: "Request an AI-powered review of your code — performance suggestions, documentation snippets, and more.",
    targetId: "ai-copilot-widget",
    placement: "left",
  },
];

export default function FeatureTour({ onClose }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  useLayoutEffect(() => {
    if (!current.targetId) {
      setRect(null);
      return;
    }
    const el = document.getElementById(current.targetId);
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    const update = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    // delay slightly to allow scroll to settle
    const t = setTimeout(update, 300);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [step, current.targetId]);

  const handleNext = () => {
    if (isLast) onClose();
    else setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  // Compute tooltip card position based on highlighted rect + placement
  const getCardStyle = () => {
    if (!rect) return S.cardCentered;

    const pad = 12;
    const cardWidth = 360;
    let top, left;

    switch (current.placement) {
      case "bottom":
        top = rect.top + rect.height + pad;
        left = rect.left;
        break;
      case "top":
        top = rect.top - pad;
        left = rect.left;
        break;
      case "right":
        top = rect.top;
        left = rect.left + rect.width + pad;
        break;
      case "left":
        top = rect.top;
        left = rect.left - cardWidth - pad;
        break;
      default:
        top = rect.top + rect.height + pad;
        left = rect.left;
    }

    // For "top" placement, anchor the card's bottom edge to `top`
    const transform = current.placement === "top" ? "translateY(-100%)" : "none";

    // Clamp horizontally within viewport
    left = Math.max(12, Math.min(left, window.innerWidth - cardWidth - 12));
    top = Math.max(12, Math.min(top, window.innerHeight - 12));

    return {
      ...S.card,
      top,
      left,
      transform,
    };
  };

  return (
    <>
      {!rect && <div style={S.overlay} onClick={onClose} />}

      {rect && (
        <div
          style={{
            ...S.highlight,
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
          }}
        />
      )}

      <div style={getCardStyle()} onClick={(e) => e.stopPropagation()}>
        <div style={S.iconWrap}>{current.icon}</div>
        <h2 style={S.title}>{current.title}</h2>
        <p style={S.desc}>{current.desc}</p>

        <div style={S.progressRow}>
          {STEPS.map((_, i) => (
            <div key={i} style={i === step ? S.dotActive : S.dot} />
          ))}
        </div>

        <div style={S.footer}>
          <button style={S.skipBtn} onClick={onClose}>
            Skip tour
          </button>
          <div style={S.navGroup}>
            {step > 0 && (
              <button style={S.backBtn} onClick={handleBack}>
                Back
              </button>
            )}
            <button style={S.nextBtn} onClick={handleNext}>
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}