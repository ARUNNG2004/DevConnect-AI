"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  markLookingForTeam,
  unmarkLookingForTeam,
} from "../../lib/hackathons";
import { captureEvent } from "../../lib/posthog/helpers";
import { EVENTS } from "../../lib/posthog/events";

function Avatar({ name, url }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="h-7 w-7 rounded-full border"
        style={{ borderColor: "var(--border-color)" }}
        referrerPolicy="no-referrer"
      />
    );
  }
  const initial = String(name || "?").charAt(0).toUpperCase();
  return (
    <div
      className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
      style={{
        backgroundColor: "var(--accent-primary-alpha)",
        color: "var(--accent-primary)",
      }}
    >
      {initial}
    </div>
  );
}

export default function TeamFinder({ event, onChange }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const list = Array.isArray(event?.lookingForTeam) ? event.lookingForTeam : [];
  const myEntry = user ? list.find((e) => e.uid === user.uid) : null;

  async function join() {
    if (!user || !event?.id || busy) return;
    if (!note.trim()) return;
    setBusy(true);
    try {
      await markLookingForTeam(event.id, user, note.trim());
      captureEvent(EVENTS.HACKATHON_TEAM_SEEKER_ADDED, { id: event.id, title: event.title });
      setNote("");
      onChange?.();
    } catch (err) {
      console.error("markLookingForTeam failed", err);
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    if (!user || !event?.id || busy) return;
    setBusy(true);
    try {
      await unmarkLookingForTeam(event.id, user);
      onChange?.();
    } catch (err) {
      console.error("unmarkLookingForTeam failed", err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="rounded-xl border p-4"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
          Looking for a Team
        </h2>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {list.length} {list.length === 1 ? "person" : "people"}
        </span>
      </div>

      {!user && (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Sign in to mark yourself as looking for a team.
        </p>
      )}

      {user && !myEntry && (
        <div className="mb-4">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={280}
            placeholder="What you bring + what you need..."
            rows={3}
            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            style={{
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          />
          <button
            type="button"
            disabled={busy || !note.trim()}
            onClick={join}
            className="mt-2 rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "#000",
            }}
          >
            Add me to the list
          </button>
        </div>
      )}

      {user && myEntry && (
        <div
          className="mb-4 flex items-start justify-between gap-2 rounded-md border p-3"
          style={{
            backgroundColor: "var(--accent-primary-alpha)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="text-sm">
            <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
              You're on the list
            </div>
            {myEntry.note && (
              <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
                {myEntry.note}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={leave}
            className="rounded-md px-2 py-1 text-xs"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-color)",
            }}
          >
            Remove
          </button>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {list.filter((e) => user == null || e.uid !== user.uid).map((e) => (
          <li
            key={e.uid}
            className="flex items-start gap-2 rounded-md border p-2"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              borderColor: "var(--border-color)",
            }}
          >
            <Avatar name={e.name} url={e.photoURL} />
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {e.name}
              </div>
              {e.note && (
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {e.note}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
