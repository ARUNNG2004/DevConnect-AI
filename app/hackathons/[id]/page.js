"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import TeamFinder from "../../../components/hackathons/TeamFinder";
import { useAuth } from "../../../context/AuthContext";
import {
  deleteHackathon,
  getHackathon,
  subscribeHackathon,
  toggleBookmark,
} from "../../../lib/hackathons";
import { captureEvent } from "../../../lib/posthog/helpers";
import { EVENTS } from "../../../lib/posthog/events";

function formatNow(d) {
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailInner() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    let unsub = () => {};
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const initial = await getHackathon(id);
        if (!active) return;
        if (!initial) {
          setError("Hackathon not found");
          setLoading(false);
          return;
        }
        setEvent(initial);
        setLoading(false);
        captureEvent(EVENTS.HACKATHON_VIEWED, { id, source: "detail", title: initial.title });
        unsub = await subscribeHackathon(id, (e) => {
          if (active) setEvent(e);
        });
      } catch (err) {
        if (active) {
          setError(err?.message || "Failed to load");
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
      try {
        unsub();
      } catch {}
    };
  }, [id]);

  async function onBookmark() {
    if (!user || !event) return;
    if (busy) return;
    setBusy(true);
    try {
      await toggleBookmark(event.id, user);
      captureEvent(EVENTS.HACKATHON_BOOKMARKED, { id: event.id, title: event.title });
    } catch (err) {
      console.error("bookmark", err);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!user || !event) return;
    if (!confirm("Delete this hackathon listing? This cannot be undone.")) return;
    if (busy) return;
    setBusy(true);
    try {
      await deleteHackathon(event.id, user);
      router.push("/hackathons");
    } catch (err) {
      alert(err?.message || "Delete failed");
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
        <Navbar />
        <p className="py-8 text-center" style={{ color: "var(--text-muted)" }}>
          Loading...
        </p>
      </div>
    );
  }
  if (error || !event) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-6 text-center">
          <p className="text-base font-medium" style={{ color: "var(--accent-warning)" }}>
            {error || "Not found"}
          </p>
          <Link href="/hackathons" className="mt-4 inline-block text-sm underline">
            Back to Hub
          </Link>
        </main>
      </div>
    );
  }

  const isAuthor = user && event.createdBy === user.uid;
  const bookmarked = user && (event.bookmarks || []).includes(user.uid);
  const regDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
  const regClosed = regDeadline && regDeadline.getTime() < Date.now();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Link
          href="/hackathons"
          className="mb-3 inline-block text-sm underline"
          style={{ color: "var(--text-secondary)" }}
        >
          &larr; Back to Hub
        </Link>

        <div
          className="mb-6 h-32 w-full rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${event.bannerColor}, var(--accent-ai))`,
          }}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="mb-2 flex flex-wrap gap-2">
              {event.mode === "offline" ? (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ color: "var(--accent-warning)" }}
                >
                  In-Person
                </span>
              ) : (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ color: "var(--accent-success)" }}
                >
                  Online
                </span>
              )}
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ color: "var(--accent-ai)" }}
              >
                {event.organizerType}
              </span>
              {regClosed && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ color: "var(--text-muted)" }}
                >
                  Registration Closed
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              {event.title}
            </h1>
            {event.organizer && (
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                by {event.organizer}
              </p>
            )}

            {event.description && (
              <p
                className="mt-4 whitespace-pre-wrap text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {event.description}
              </p>
            )}

            <div
              className="mt-6 grid grid-cols-1 gap-4 rounded-xl border p-4 text-sm md:grid-cols-2"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
                color: "var(--text-secondary)",
              }}
            >
              {event.startDate && (
                <div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Starts
                  </div>
                  <div>{formatNow(new Date(event.startDate))}</div>
                </div>
              )}
              {event.endDate && (
                <div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Ends
                  </div>
                  <div>{formatNow(new Date(event.endDate))}</div>
                </div>
              )}
              {event.registrationDeadline && (
                <div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Registration Deadline
                  </div>
                  <div>{formatNow(new Date(event.registrationDeadline))}</div>
                </div>
              )}
              {event.mode === "offline" && (event.city || event.location) && (
                <div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Location
                  </div>
                  <div>
                    {[event.city, event.location].filter(Boolean).join(", ")}
                  </div>
                </div>
              )}
              {event.maxTeamSize && (
                <div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Max Team Size
                  </div>
                  <div>{event.maxTeamSize}</div>
                </div>
              )}
            </div>

            {event.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {event.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {event.websiteUrl && (
                <a
                  href={event.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md px-4 py-2 text-sm font-semibold"
                  style={{
                    backgroundColor: "var(--accent-primary)",
                    color: "#000",
                  }}
                >
                  Register on Organizer Site &rarr;
                </a>
              )}
              {user && !isAuthor && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={onBookmark}
                  aria-pressed={bookmarked}
                  className="rounded-md border px-4 py-2 text-sm"
                  style={{
                    borderColor: "var(--border-color)",
                    backgroundColor: bookmarked
                      ? "var(--accent-primary-alpha)"
                      : "transparent",
                    color: bookmarked
                      ? "var(--accent-primary)"
                      : "var(--text-secondary)",
                  }}
                >
                  {bookmarked ? "Saved" : "Bookmark"}
                </button>
              )}
              {isAuthor && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={onDelete}
                  className="rounded-md border px-4 py-2 text-sm"
                  style={{
                    borderColor: "var(--border-color)",
                    color: "var(--accent-warning)",
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <TeamFinder event={event} onChange={() => {}} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function HackathonDetailPage() {
  return (
    <ProtectedRoute>
      <DetailInner />
    </ProtectedRoute>
  );
}
