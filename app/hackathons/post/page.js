"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Navbar from "../../../components/Navbar";
import ProtectedRoute from "../../../components/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import { createHackathon } from "../../../lib/hackathons";
import { captureEvent } from "../../../lib/posthog/helpers";
import { EVENTS } from "../../../lib/posthog/events";

const BANNER_COLORS = [
  "var(--accent-primary)",
  "var(--accent-ai)",
  "var(--accent-success)",
  "var(--accent-warning)",
];

function Field({ label, children, hint }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
      {children}
      {hint && (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {hint}
        </span>
      )}
    </label>
  );
}

const inputStyle = {
  backgroundColor: "transparent",
  borderColor: "var(--border-color)",
  color: "var(--text-primary)",
};

function PostInner() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    organizer: user?.displayName || "",
    organizerType: "student",
    mode: "online",
    location: "",
    city: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    websiteUrl: "",
    tags: "",
    bannerColor: BANNER_COLORS[0],
    maxTeamSize: 4,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (busy) return;
    if (!form.title.trim()) {
      setErr("Title is required");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const payload = {
        ...form,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        maxTeamSize: Number(form.maxTeamSize) || 4,
      };
      const id = await createHackathon(payload, user);
      captureEvent(EVENTS.HACKATHON_POSTED, { id, title: form.title });
      router.push(`/hackathons/${id}`);
    } catch (e2) {
      console.error("createHackathon failed", e2);
      setErr(e2?.message || "Failed to post hackathon");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <header className="mb-4">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Post a Hackathon
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Share a hackathon for the DevConnect community.
          </p>
        </header>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-4 rounded-xl border p-4"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
          }}
        >
          <Field label="Title *">
            <input
              type="text"
              required
              maxLength={120}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="rounded-md border px-3 py-2"
              style={inputStyle}
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={4}
              maxLength={1200}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="rounded-md border px-3 py-2"
              style={inputStyle}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Organizer">
              <input
                type="text"
                value={form.organizer}
                onChange={(e) => set("organizer", e.target.value)}
                className="rounded-md border px-3 py-2"
                style={inputStyle}
              />
            </Field>
            <Field label="Organizer Type">
              <select
                value={form.organizerType}
                onChange={(e) => set("organizerType", e.target.value)}
                className="rounded-md border px-3 py-2"
                style={inputStyle}
              >
                <option value="student">Student</option>
                <option value="company">Company</option>
                <option value="community">Community</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Mode">
              <select
                value={form.mode}
                onChange={(e) => set("mode", e.target.value)}
                className="rounded-md border px-3 py-2"
                style={inputStyle}
              >
                <option value="online">Online</option>
                <option value="offline">In-Person</option>
              </select>
            </Field>
            <Field label="City" hint="For in-person events">
              <input
                type="text"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                className="rounded-md border px-3 py-2"
                style={inputStyle}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Start Date">
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className="rounded-md border px-3 py-2"
                style={inputStyle}
              />
            </Field>
            <Field label="End Date">
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className="rounded-md border px-3 py-2"
                style={inputStyle}
              />
            </Field>
            <Field label="Registration Deadline">
              <input
                type="datetime-local"
                value={form.registrationDeadline}
                onChange={(e) => set("registrationDeadline", e.target.value)}
                className="rounded-md border px-3 py-2"
                style={inputStyle}
              />
            </Field>
          </div>

          <Field label="External Website" hint="Where users register / get full details">
            <input
              type="url"
              placeholder="https://"
              value={form.websiteUrl}
              onChange={(e) => set("websiteUrl", e.target.value)}
              className="rounded-md border px-3 py-2"
              style={inputStyle}
            />
          </Field>

          <Field label="Tags" hint="Comma-separated, e.g. AI, Web, Climate">
            <input
              type="text"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="AI, Web3, Climate"
              className="rounded-md border px-3 py-2"
              style={inputStyle}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Max Team Size">
              <input
                type="number"
                min={1}
                max={10}
                value={form.maxTeamSize}
                onChange={(e) => set("maxTeamSize", e.target.value)}
                className="rounded-md border px-3 py-2"
                style={inputStyle}
              />
            </Field>
            <Field label="Banner Color">
              <div className="flex items-center gap-2">
                {BANNER_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    aria-label={`color ${c}`}
                    onClick={() => set("bannerColor", c)}
                    className="h-7 w-7 rounded-full"
                    style={{
                      backgroundColor: c,
                      border:
                        form.bannerColor === c
                          ? "2px solid var(--text-primary)"
                          : "2px solid transparent",
                    }}
                  />
                ))}
              </div>
            </Field>
          </div>

          {err && (
            <p className="text-sm" style={{ color: "var(--accent-warning)" }}>
              {err}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push("/hackathons")}
              className="rounded-md border px-4 py-2 text-sm"
              style={{
                borderColor: "var(--border-color)",
                color: "var(--text-secondary)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-40"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
                color: "#000",
              }}
            >
              {busy ? "Posting..." : "Post Hackathon"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function PostHackathonPage() {
  return (
    <ProtectedRoute>
      <PostInner />
    </ProtectedRoute>
  );
}
