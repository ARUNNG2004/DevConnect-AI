"use client";

import { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function RoomSummaryModal({ summary, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!summary) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [summary, onClose]);

  if (!summary) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Room summary"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "640px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-color)",
        }}>
          <h3 id="summary-modal-title" style={{ fontSize: "1rem", margin: 0, color: "var(--text-primary)", fontWeight: 600 }}>
            Room Summary
          </h3>
          <button
            onClick={onClose}
            aria-label="Close summary"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "1.1rem",
              padding: "4px 8px",
              borderRadius: "6px",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          className="markdown"
          aria-labelledby="summary-modal-title"
          style={{
            padding: "20px",
            overflowY: "auto",
            flex: 1,
            fontSize: "0.9rem",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
          }}
        >
          <Markdown remarkPlugins={[remarkGfm]}>{summary}</Markdown>
        </div>
      </div>
    </div>
  );
}