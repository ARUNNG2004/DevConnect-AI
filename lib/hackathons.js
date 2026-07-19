"use client";

import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "events";
const EVENT_KIND = "hackathon";

function toISO(ts) {
  if (!ts) return null;
  if (typeof ts === "string") return ts;
  if (typeof ts === "object" && typeof ts.toDate === "function") return ts.toDate().toISOString();
  try {
    return new Date(ts).toISOString();
  } catch {
    return null;
  }
}

export function normalizeEvent(raw, id) {
  if (!raw) return null;
  return {
    id: id || raw.id || null,
    kind: raw.kind || EVENT_KIND,
    title: raw.title || "Untitled Hackathon",
    description: raw.description || "",
    organizer: raw.organizer || "",
    organizerType: raw.organizerType || "student",
    mode: raw.mode === "offline" ? "offline" : "online",
    location: raw.location || "",
    city: raw.city || "",
    startDate: toISO(raw.startDate),
    endDate: toISO(raw.endDate),
    registrationDeadline: toISO(raw.registrationDeadline),
    websiteUrl: raw.websiteUrl || "",
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    bannerColor: raw.bannerColor || "var(--accent-primary)",
    maxTeamSize: Number(raw.maxTeamSize) || 4,
    lookingForTeam: Array.isArray(raw.lookingForTeam) ? raw.lookingForTeam : [],
    bookmarks: Array.isArray(raw.bookmarks) ? raw.bookmarks : [],
    createdBy: raw.createdBy || null,
    createdAt: toISO(raw.createdAt),
    updatedAt: toISO(raw.updatedAt),
  };
}

export async function listHackathons({ mode, organizerType, tag, search } = {}) {
  if (!db) return [];
  let q = query(
    collection(db, COLLECTION),
    where("kind", "==", EVENT_KIND),
    orderBy("createdAt", "desc"),
  );
  if (mode) q = query(q, where("mode", "==", mode));
  if (organizerType) q = query(q, where("organizerType", "==", organizerType));
  if (tag) q = query(q, where("tags", "array-contains", tag));
  const snap = await getDocs(q);
  let items = snap.docs.map((d) => normalizeEvent(d.data(), d.id));
  if (search) {
    const s = String(search).toLowerCase();
    items = items.filter(
      (e) =>
        e.title.toLowerCase().includes(s) ||
        e.description.toLowerCase().includes(s) ||
        e.organizer.toLowerCase().includes(s) ||
        (e.city || "").toLowerCase().includes(s) ||
        e.tags.some((t) => String(t).toLowerCase().includes(s)),
    );
  }
  return items;
}

export async function getHackathon(id) {
  if (!db || !id) return null;
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return normalizeEvent(snap.data(), snap.id);
}

export async function createHackathon(payload, user) {
  if (!db) throw new Error("Firestore not initialized");
  if (!user) throw new Error("Auth required to post a hackathon");
  const body = {
    kind: EVENT_KIND,
    title: payload.title?.trim(),
    description: payload.description?.trim() || "",
    organizer: payload.organizer?.trim() || "",
    organizerType: ["student", "company", "community"].includes(payload.organizerType)
      ? payload.organizerType
      : "student",
    mode: payload.mode === "offline" ? "offline" : "online",
    location: payload.location?.trim() || "",
    city: payload.city?.trim() || "",
    startDate: payload.startDate || null,
    endDate: payload.endDate || null,
    registrationDeadline: payload.registrationDeadline || null,
    websiteUrl: payload.websiteUrl?.trim() || "",
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    bannerColor: payload.bannerColor || "var(--accent-primary)",
    maxTeamSize: Number(payload.maxTeamSize) || 4,
    lookingForTeam: [],
    bookmarks: [],
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (!body.title) throw new Error("Title is required");
  const ref = await addDoc(collection(db, COLLECTION), body);
  return ref.id;
}

export async function updateHackathon(id, payload) {
  if (!db || !id) throw new Error("updateHackathon: invalid args");
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
}

export async function deleteHackathon(id, user) {
  if (!db || !id || !user) throw new Error("deleteHackathon: invalid args");
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Hackathon not found");
  const data = snap.data();
  if (data.createdBy !== user.uid) throw new Error("Only the author can delete this hackathon");
  await deleteDoc(ref);
}

export async function toggleBookmark(id, user) {
  if (!db || !id || !user) throw new Error("toggleBookmark: invalid args");
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Hackathon not found");
  const bookmarks = Array.isArray(snap.data().bookmarks) ? snap.data().bookmarks : [];
  const already = bookmarks.includes(user.uid);
  await updateDoc(ref, {
    bookmarks: already ? arrayRemove(user.uid) : arrayUnion(user.uid),
    updatedAt: serverTimestamp(),
  });
  return !already;
}

export async function markLookingForTeam(id, user, note) {
  if (!db || !id || !user) throw new Error("markLookingForTeam: invalid args");
  const ref = doc(db, COLLECTION, id);
  const entry = {
    uid: user.uid,
    name: user.displayName || "Anonymous",
    photoURL: user.photoURL || "",
    note: String(note || "").slice(0, 280),
    addedAt: new Date().toISOString(),
  };
  await updateDoc(ref, {
    lookingForTeam: arrayUnion(entry),
    updatedAt: serverTimestamp(),
  });
  return entry;
}

export async function unmarkLookingForTeam(id, user) {
  if (!db || !id || !user) throw new Error("unmarkLookingForTeam: invalid args");
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const list = Array.isArray(snap.data().lookingForTeam) ? snap.data().lookingForTeam : [];
  const next = list.filter((e) => e.uid !== user.uid);
  await updateDoc(ref, { lookingForTeam: next, updatedAt: serverTimestamp() });
}

export async function subscribeHackathon(id, cb) {
  if (!db || !id) throw new Error("subscribeHackathon: invalid args");
  const { onSnapshot } = await import("firebase/firestore");
  const ref = doc(db, COLLECTION, id);
  return onSnapshot(ref, (snap) => {
    cb(snap.exists() ? normalizeEvent(snap.data(), snap.id) : null);
  });
}

export async function subscribeHackathons(cb) {
  if (!db) throw new Error("subscribeHackathons: db not initialized");
  const { onSnapshot } = await import("firebase/firestore");
  const q = query(
    collection(db, COLLECTION),
    where("kind", "==", EVENT_KIND),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => normalizeEvent(d.data(), d.id)));
  });
}
