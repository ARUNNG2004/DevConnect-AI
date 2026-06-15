"use client";

import { useState } from "react";

export default function AIDraftAssistant({ onInsert }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate draft");
      onInsert(data.draft);
      setPrompt("");
    } catch (err) {
      console.error(err);
      setError("Could not generate draft. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 12,
        backgroundColor: "var(--bg-primary)",
        border: "1px solid var(--accent-ai)",
        borderRadius: "var(--radius-md)",
        marginTop: 8,
      }}
    >
      <textarea
        style={{
          width: "100%",
          minHeight: 50,
          background: "transparent",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-sm)",
          color: "var(--text-primary)",
          outline: "none",
          fontSize: "0.85rem",
          fontFamily: "inherit",
          padding: 8,
          resize: "vertical",
        }}
        placeholder="Tell the AI what to write about (e.g. 'a post asking for help debugging a React useEffect loop')..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      {error && <p style={{ color: "#f87171", fontSize: "0.8rem", margin: 0 }}>{error}</p>}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          style={{
            padding: "6px 14px",
            backgroundColor: "var(--accent-ai)",
            border: "none",
            borderRadius: "var(--radius-md)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.8rem",
            cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
            opacity: loading || !prompt.trim() ? 0.6 : 1,
          }}
        >
          {loading ? "Generating..." : "Generate Draft"}
        </button>
      </div>
    </div>
  );
}