"use client";

import { useMemo } from "react";

const MODES = [
  { value: "", label: "All Modes" },
  { value: "online", label: "Online" },
  { value: "offline", label: "In-Person" },
];

const ORGS = [
  { value: "", label: "All Organizers" },
  { value: "student", label: "Student" },
  { value: "company", label: "Company" },
  { value: "community", label: "Community" },
];

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "deadline", label: "Registration Deadline" },
  { value: "start", label: "Start Date" },
];

export default function HackathonFilters({
  mode,
  setMode,
  organizerType,
  setOrganizerType,
  tag,
  setTag,
  search,
  setSearch,
  sort,
  setSort,
  tags,
}) {
  const tagList = useMemo(() => Array.from(tags || []).sort(), [tags]);
  return (
    <div
      className="mb-6 grid grid-cols-1 gap-3 rounded-xl border p-4 md:grid-cols-5"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      <input
        type="search"
        placeholder="Search hackathons..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="rounded-md border bg-transparent px-3 py-2 text-sm"
        style={{
          borderColor: "var(--border-color)",
          color: "var(--text-primary)",
        }}
      />

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="rounded-md border bg-transparent px-3 py-2 text-sm"
        style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
      >
        {MODES.map((m) => (
          <option key={m.value} value={m.value} style={{ color: "var(--text-primary)" }}>
            {m.label}
          </option>
        ))}
      </select>

      <select
        value={organizerType}
        onChange={(e) => setOrganizerType(e.target.value)}
        className="rounded-md border bg-transparent px-3 py-2 text-sm"
        style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
      >
        {ORGS.map((o) => (
          <option key={o.value} value={o.value} style={{ color: "var(--text-primary)" }}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        className="rounded-md border bg-transparent px-3 py-2 text-sm"
        style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
      >
        <option value="">All Topics</option>
        {tagList.map((t) => (
          <option key={t} value={t} style={{ color: "var(--text-primary)" }}>
            #{t}
          </option>
        ))}
      </select>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="rounded-md border bg-transparent px-3 py-2 text-sm"
        style={{ borderColor: "var(--border-color)", color: "var(--text-primary)" }}
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value} style={{ color: "var(--text-primary)" }}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
