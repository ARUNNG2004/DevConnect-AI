"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { toggleBookmark } from "../../lib/hackathons";
import { captureEvent } from "../../lib/posthog/helpers";
import { EVENTS } from "../../lib/posthog/events";

const MODE_BADGE = {
  online: { label: "Online", color: "var(--accent-success)" },
  offline: { label: "In-Person", color: "var(--accent-warning)" },
};

const ORG_BADGE = {
  student: { label: "Student", color: "var(--accent-primary)" },
  company: { label: "Company", color: "var(--accent-ai)" },
  community: { label: "Community", color: "var(--accent-warning)" },
};

function formatDate(iso) {
  if (!iso) return "TBD";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "TBD";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function HackathonCard({ event, onChange }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const bookmarked = !!(user && event.bookmarks?.includes(user.uid));
  const mode = MODE_BADGE[event.mode] || MODE_BADGE.online;
  const org = ORG_BADGE[event.organizerType] || ORG_BADGE.student;

  async function onBookmark(e) {
    e.preventDefault();
    if (!user) return;
    if (busy) return;
    setBusy(true);
    try {
      await toggleBookmark(event.id, user);
      captureEvent(EVENTS.HACKATHON_BOOKMARKED, { id: event.id, title: event.title });
      onChange?.();
    } catch (err) {
      console.error("bookmark failed", err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Link
      href={`/hackathons/${event.id}`}
      className="group relative flex flex-col rounded-xl border transition hover:shadow-lg"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      <div
        className="h-24 w-full rounded-t-xl"
        style={{
          background: `linear-gradient(135deg, ${event.bannerColor || "var(--accent-primary)"}, var(--accent-ai))`,
        }}
      />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className="rounded-full px-2 py-0.5 font-semibold"
              style={{ backgroundColor: "var(--accent-primary-alpha)", color: mode.color }}
            >
              {mode.label}
            </span>
            <span
              className="rounded-full px-2 py-0.5 font-semibold"
              style={{ backgroundColor: "var(--accent-ai-alpha)", color: org.color }}
            >
              {org.label}
            </span>
          </div>
          <button
            type="button"
            disabled={!user || busy}
            onClick={onBookmark}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark hackathon"}
            className="rounded-md px-2 py-1 text-sm transition disabled:opacity-40"
            style={{
              backgroundColor: bookmarked ? "var(--accent-primary-alpha)" : "transparent",
              color: bookmarked ? "var(--accent-primary)" : "var(--text-muted)",
              border: "1px solid var(--border-color)",
            }}
          >
            {bookmarked ? "Saved" : "Save"}
          </button>
        </div>

        <h3
          className="text-base font-semibold leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {event.title}
        </h3>

        {event.organizer && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            by {event.organizer}
          </p>
        )}

        <p
          className="line-clamp-3 text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {event.description || "No description provided."}
        </p>

        <div className="mt-auto flex flex-col gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
          <div>
            {formatDate(event.startDate)} — {formatDate(event.endDate)}
          </div>
          {event.mode === "offline" && event.city && <div>Location: {event.city}</div>}
          {event.lookingForTeam?.length > 0 && (
            <div style={{ color: "var(--accent-success)" }}>
              {event.lookingForTeam.length} looking for a team
            </div>
          )}
        </div>

        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded px-1.5 py-0.5 text-[10px]"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
