"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

export default function RoomSummaryButton({ roomId, onSummaryGenerated, hasSummary, onViewSummary }) {
  const [generating, setGenerating] = useState(false);
  const { user } = useAuth();

  const handleClick = useCallback(async () => {
    if (!user) {
      toast.error("Login required");
      return;
    }

    // If summary already cached, just open it
    if (hasSummary) {
      onViewSummary?.();
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/rooms/" + roomId + "/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to generate summary");
        return;
      }
      const data = await res.json();
      if (data.summary) onSummaryGenerated?.(data.summary);
      toast.success("Summary generated!");
    } catch (e) {
      console.error(e);
      toast.error("Network error");
    } finally {
      setGenerating(false);
    }
  }, [roomId, user, onSummaryGenerated, hasSummary, onViewSummary]);

  return (
    <div>
      <button onClick={handleClick} disabled={generating || !user} aria-label={hasSummary ? "View room summary" : "Generate room summary"}>
        {generating ? "Generating..." : hasSummary ? "View Summary" : "Generate Summary"}
      </button>
    </div>
  );
}