"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import HackathonCard from "../../components/hackathons/HackathonCard";
import HackathonFilters from "../../components/hackathons/HackathonFilters";
import { useAuth } from "../../context/AuthContext";
import { subscribeHackathons } from "../../lib/hackathons";
import { captureEvent } from "../../lib/posthog/helpers";
import { EVENTS } from "../../lib/posthog/events";

function sortEvents(items, sort) {
  const out = [...items];
  if (sort === "deadline") {
    out.sort((a, b) => {
      const ta = a.registrationDeadline ? new Date(a.registrationDeadline).getTime() : Infinity;
      const tb = b.registrationDeadline ? new Date(b.registrationDeadline).getTime() : Infinity;
      return ta - tb;
    });
  } else if (sort === "start") {
    out.sort((a, b) => {
      const ta = a.startDate ? new Date(a.startDate).getTime() : Infinity;
      const tb = b.startDate ? new Date(b.startDate).getTime() : Infinity;
      return ta - tb;
    });
  } else {
    out.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });
  }
  return out;
}

function HubInner() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mode, setMode] = useState("");
  const [organizerType, setOrganizerType] = useState("");
  const [tag, setTag] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    let unsub = () => {};
    let active = true;
    setLoading(true);
    subscribeHackathons((items) => {
      if (!active) return;
      setEvents(items);
      setLoading(false);
    })
      .then((u) => {
        unsub = u;
      })
      .catch((err) => {
        console.error("subscribeHackathons failed", err);
        if (active) {
          setError(err?.message || "Failed to load hackathons");
          setLoading(false);
        }
      });
    return () => {
      active = false;
      try {
        unsub();
      } catch {}
    };
  }, []);

  const refresh = useCallback(() => {
    setEvents((prev) => [...prev]);
  }, []);

  const allTags = useMemo(() => {
    const s = new Set();
    for (const e of events) for (const t of e.tags || []) s.add(t);
    return s;
  }, [events]);

  const filtered = useMemo(() => {
    let list = sortEvents(events, sort);
    if (mode) list = list.filter((e) => e.mode === mode);
    if (organizerType) list = list.filter((e) => e.organizerType === organizerType);
    if (tag) list = list.filter((e) => (e.tags || []).includes(tag));
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(s) ||
          e.description.toLowerCase().includes(s) ||
          e.organizer.toLowerCase().includes(s) ||
          (e.city || "").toLowerCase().includes(s) ||
          (e.tags || []).some((t) => String(t).toLowerCase().includes(s)),
      );
    }
    return list;
  }, [events, mode, organizerType, tag, search, sort]);

  const myBookmarks = useMemo(
    () => (user ? filtered.filter((e) => (e.bookmarks || []).includes(user.uid)) : []),
    [filtered, user],
  );

  useEffect(() => {
    captureEvent(EVENTS.HACKATHON_VIEWED, { source: "hub", count: filtered.length });
  }, [filtered.length]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              Hackathon Hub
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Discover hackathons, find teammates, and bookmark the ones you love.
            </p>
          </div>
          <Link
            href="/hackathons/post"
            className="rounded-md px-4 py-2 text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
              color: "#000",
            }}
          >
            + Post a Hackathon
          </Link>
        </header>

        <HackathonFilters
          mode={mode}
          setMode={setMode}
          organizerType={organizerType}
          setOrganizerType={setOrganizerType}
          tag={tag}
          setTag={setTag}
          search={search}
          setSearch={setSearch}
          sort={sort}
          setSort={setSort}
          tags={allTags}
        />

        {loading && (
          <p className="py-8 text-center" style={{ color: "var(--text-muted)" }}>
            Loading hackathons...
          </p>
        )}
        {error && (
          <p className="py-8 text-center" style={{ color: "var(--accent-warning)" }}>
            {error}
          </p>
        )}

        {!loading && !error && user && myBookmarks.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              Your Saved ({myBookmarks.length})
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {myBookmarks.map((e) => (
                <HackathonCard key={e.id} event={e} onChange={refresh} />
              ))}
            </div>
          </section>
        )}

        {!loading && !error && (
          <>
            <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
              {filtered.length} {filtered.length === 1 ? "Hackathon" : "Hackathons"}
            </h2>
            {filtered.length === 0 ? (
              <div
                className="rounded-xl border p-8 text-center"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <p className="text-base font-medium" style={{ color: "var(--text-primary)" }}>
                  No hackathons match your filters
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                  Try clearing filters or post the first one!
                </p>
                <Link
                  href="/hackathons/post"
                  className="mt-4 inline-block rounded-md px-4 py-2 text-sm font-semibold"
                  style={{
                    backgroundColor: "var(--accent-primary)",
                    color: "#000",
                  }}
                >
                  Post a Hackathon
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {filtered.map((e) => (
                  <HackathonCard key={e.id} event={e} onChange={refresh} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function HackathonsPage() {
  return (
    <ProtectedRoute>
      <HubInner />
    </ProtectedRoute>
  );
}
