"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

const S = {
  wrap: { position: "relative", display: "inline-block" },
  bellBtn: (active) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    background: active ? "var(--accent-primary-alpha)" : "transparent",
    border: `1.5px solid ${active ? "var(--accent-primary)" : "var(--border-color)"}`,
    borderRadius: "var(--radius-md)",
    color: active ? "var(--accent-primary)" : "var(--text-secondary)",
    cursor: "pointer",
    fontSize: "1rem",
    position: "relative",
    flexShrink: 0,
  }),
  unreadDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 9,
    height: 9,
    borderRadius: "50%",
    backgroundColor: "#3b82f6",
    boxShadow: "0 0 0 2px var(--bg-secondary), 0 0 6px rgba(59,130,246,0.8)",
  },
  panel: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    width: 340,
    maxHeight: 440,
    overflowY: "auto",
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
    zIndex: 200,
  },
  panelMobile: {
    position: "fixed",
    top: 64,
    left: 8,
    right: 8,
    width: "auto",
    maxHeight: "70vh",
    overflowY: "auto",
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
    zIndex: 200,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    borderBottom: "1px solid var(--border-color)",
  },
  headerTitle: { fontWeight: 700, fontSize: "0.92rem", color: "var(--text-primary)" },
  markAllBtn: {
    background: "transparent",
    border: "none",
    color: "var(--accent-primary)",
    fontSize: "0.76rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  item: (unread) => ({
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    padding: "12px 14px",
    cursor: "pointer",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    backgroundColor: unread ? "var(--accent-primary-alpha)" : "transparent",
  }),
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0284c7, #38bdf8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    fontWeight: 700,
    fontSize: "0.85rem",
    flexShrink: 0,
    overflow: "hidden",
  },
  itemText: { fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.4 },
  itemName: { fontWeight: 700, color: "var(--text-primary)" },
  itemMeta: { fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 3 },
  unreadBall: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#3b82f6",
    flexShrink: 0,
    marginTop: 4,
  },
  emptyState: {
    padding: "32px 16px",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "0.85rem",
  },
};

const ICONS = {
  like: "❤️",
  follow: "➕",
  comment: "💬",
  comment_edit: "✏️",
  solved: "✅",
};

function textFor(n) {
  switch (n.type) {
    case "like":
      return <>liked your post</>;
    case "follow":
      return <>started following you</>;
    case "comment":
      return <>commented on your post{n.preview ? `: "${n.preview}"` : ""}</>;
    case "comment_edit":
      return <>edited their comment{n.preview ? `: "${n.preview}"` : ""}</>;
    case "solved":
      return <>marked your comment as the accepted answer ✅</>;
    default:
      return <>interacted with your content</>;
  }
}

function timeAgo(ts) {
  if (!ts?.toDate) return "Just now";
  const date = ts.toDate();
  const diffSec = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Notifications({ isMobile = false }) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    const q = query(
      collection(db, "notifications"),
      where("toUid", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(30)
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Failed to load notifications:", err));
    return () => unsub();
  }, [user]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const unreadCount = items.filter((n) => !n.read).length;

  const clearAll = useCallback(async (e) => {
    e.stopPropagation();
    if (items.length === 0) return;
    const toClear = items;
    setItems([]);
    try {
      const batch = writeBatch(db);
      toClear.forEach((n) => batch.delete(doc(db, "notifications", n.id)));
      await batch.commit();
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  }, [items]);

  const handleItemClick = useCallback(async (n) => {
    setOpen(false);
    // Optimistically remove it from the list right away, then delete it
    // server-side so it doesn't come back.
    setItems((prev) => prev.filter((item) => item.id !== n.id));
    try { await deleteDoc(doc(db, "notifications", n.id)); }
    catch (err) { console.error("Failed to remove notification:", err); }

    if (n.type === "follow") {
      router.push(`/user/${n.fromUid}`);
      return;
    }

    if (n.postId) {
      const targetHash = `#post-${n.postId}`;
      const isOnDashboard = window.location.pathname === "/dashboard";
      if (isOnDashboard) {
        window.location.hash = targetHash;
        window.dispatchEvent(new Event("dashboard-scroll-request"));
      } else {
        router.push(`/dashboard${targetHash}`);
      }
    }
  }, [router]);

  if (!user) return null;

  return (
    <div style={S.wrap} ref={wrapRef}>
      <button
        style={S.bellBtn(open)}
        title="Notifications"
        type="button"
        onClick={() => setOpen((o) => !o)}
      >
        🔔
        {unreadCount > 0 && <span style={S.unreadDot} />}
      </button>

      {open && (
        <div style={isMobile ? S.panelMobile : S.panel}>
          <div style={S.header}>
            <span style={S.headerTitle}>
              Notifications {unreadCount > 0 ? `(${unreadCount})` : ""}
            </span>
            {items.length > 0 && (
              <button style={S.markAllBtn} onClick={clearAll} type="button">
                Clear all
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div style={S.emptyState}>
              <div style={{ fontSize: "1.6rem", marginBottom: 6 }}>🔔</div>
              No notifications yet.
            </div>
          ) : (
            items.map((n) => (
              <div
                key={n.id}
                style={S.item(!n.read)}
                onClick={() => handleItemClick(n)}
              >
                <div style={S.avatar}>
                  {n.fromPhoto
                    ? <img src={n.fromPhoto} alt={n.fromName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : (n.fromName?.charAt(0)?.toUpperCase() || "U")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={S.itemText}>
                    <span style={S.itemName}>{n.fromName}</span>{" "}
                    {textFor(n)}
                  </div>
                  <div style={S.itemMeta}>
                    {ICONS[n.type] || "🔔"} {timeAgo(n.timestamp)}
                  </div>
                </div>
                {!n.read && <span style={S.unreadBall} />}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "../context/AuthContext";
// import { db } from "../lib/firebase";
// import {
//   collection,
//   query,
//   where,
//   orderBy,
//   limit,
//   onSnapshot,
//   doc,
//   updateDoc,
//   deleteDoc,
//   writeBatch,
// } from "firebase/firestore";

// const S = {
//   wrap: { position: "relative", display: "inline-block" },
//   bellBtn: (active) => ({
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     width: 40,
//     height: 40,
//     background: active ? "var(--accent-primary-alpha)" : "transparent",
//     border: `1.5px solid ${active ? "var(--accent-primary)" : "var(--border-color)"}`,
//     borderRadius: "var(--radius-md)",
//     color: active ? "var(--accent-primary)" : "var(--text-secondary)",
//     cursor: "pointer",
//     fontSize: "1rem",
//     position: "relative",
//     flexShrink: 0,
//   }),
//   unreadDot: {
//     position: "absolute",
//     top: 6,
//     right: 6,
//     width: 9,
//     height: 9,
//     borderRadius: "50%",
//     backgroundColor: "#3b82f6",
//     boxShadow: "0 0 0 2px var(--bg-secondary), 0 0 6px rgba(59,130,246,0.8)",
//   },
//   panel: {
//     position: "absolute",
//     top: "calc(100% + 10px)",
//     right: 0,
//     width: 340,
//     maxHeight: 440,
//     overflowY: "auto",
//     backgroundColor: "var(--bg-secondary)",
//     border: "1px solid var(--border-color)",
//     borderRadius: "var(--radius-lg)",
//     boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
//     zIndex: 200,
//   },
//   panelMobile: {
//     position: "fixed",
//     top: 64,
//     left: 8,
//     right: 8,
//     width: "auto",
//     maxHeight: "70vh",
//     overflowY: "auto",
//     backgroundColor: "var(--bg-secondary)",
//     border: "1px solid var(--border-color)",
//     borderRadius: "var(--radius-lg)",
//     boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
//     zIndex: 200,
//   },
//   header: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "space-between",
//     padding: "12px 14px",
//     borderBottom: "1px solid var(--border-color)",
//   },
//   headerTitle: { fontWeight: 700, fontSize: "0.92rem", color: "var(--text-primary)" },
//   markAllBtn: {
//     background: "transparent",
//     border: "none",
//     color: "var(--accent-primary)",
//     fontSize: "0.76rem",
//     fontWeight: 600,
//     cursor: "pointer",
//     fontFamily: "inherit",
//   },
//   item: (unread) => ({
//     display: "flex",
//     gap: 10,
//     alignItems: "flex-start",
//     padding: "12px 14px",
//     cursor: "pointer",
//     borderBottom: "1px solid rgba(255,255,255,0.05)",
//     backgroundColor: unread ? "var(--accent-primary-alpha)" : "transparent",
//   }),
//   avatar: {
//     width: 34,
//     height: 34,
//     borderRadius: "50%",
//     background: "linear-gradient(135deg, #0284c7, #38bdf8)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     color: "#000",
//     fontWeight: 700,
//     fontSize: "0.85rem",
//     flexShrink: 0,
//     overflow: "hidden",
//   },
//   itemText: { fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.4 },
//   itemName: { fontWeight: 700, color: "var(--text-primary)" },
//   itemMeta: { fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 3 },
//   unreadBall: {
//     width: 8,
//     height: 8,
//     borderRadius: "50%",
//     backgroundColor: "#3b82f6",
//     flexShrink: 0,
//     marginTop: 4,
//   },
//   emptyState: {
//     padding: "32px 16px",
//     textAlign: "center",
//     color: "var(--text-muted)",
//     fontSize: "0.85rem",
//   },
// };

// const ICONS = {
//   like: "❤️",
//   follow: "➕",
//   comment: "💬",
//   comment_edit: "✏️",
// };

// function textFor(n) {
//   switch (n.type) {
//     case "like":
//       return <>liked your post</>;
//     case "follow":
//       return <>started following you</>;
//     case "comment":
//       return <>commented on your post{n.preview ? `: "${n.preview}"` : ""}</>;
//     case "comment_edit":
//       return <>edited their comment{n.preview ? `: "${n.preview}"` : ""}</>;
//     default:
//       return <>interacted with your content</>;
//   }
// }

// function timeAgo(ts) {
//   if (!ts?.toDate) return "Just now";
//   const date = ts.toDate();
//   const diffSec = Math.max(0, (Date.now() - date.getTime()) / 1000);
//   if (diffSec < 60) return "Just now";
//   if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
//   if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
//   return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
// }

// export default function Notifications({ isMobile = false }) {
//   const { user } = useAuth();
//   const router = useRouter();
//   const [open, setOpen] = useState(false);
//   const [items, setItems] = useState([]);
//   const wrapRef = useRef(null);

//   useEffect(() => {
//     if (!user) {
//       setItems([]);
//       return;
//     }
//     const q = query(
//       collection(db, "notifications"),
//       where("toUid", "==", user.uid),
//       orderBy("timestamp", "desc"),
//       limit(30)
//     );
//     const unsub = onSnapshot(q, (snap) => {
//       setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
//     }, (err) => console.error("Failed to load notifications:", err));
//     return () => unsub();
//   }, [user]);

//   // Close on outside click
//   useEffect(() => {
//     if (!open) return;
//     const handler = (e) => {
//       if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, [open]);

//   const unreadCount = items.filter((n) => !n.read).length;

//   const clearAll = useCallback(async (e) => {
//     e.stopPropagation();
//     if (items.length === 0) return;
//     const toClear = items;
//     setItems([]);
//     try {
//       const batch = writeBatch(db);
//       toClear.forEach((n) => batch.delete(doc(db, "notifications", n.id)));
//       await batch.commit();
//     } catch (err) {
//       console.error("Failed to clear notifications:", err);
//     }
//   }, [items]);

//   const handleItemClick = useCallback(async (n) => {
//     setOpen(false);
//     // Optimistically remove it from the list right away, then delete it
//     // server-side so it doesn't come back.
//     setItems((prev) => prev.filter((item) => item.id !== n.id));
//     try { await deleteDoc(doc(db, "notifications", n.id)); }
//     catch (err) { console.error("Failed to remove notification:", err); }

//     if (n.type === "follow") {
//       router.push(`/user/${n.fromUid}`);
//       return;
//     }

//     if (n.postId) {
//       const targetHash = `#post-${n.postId}`;
//       const isOnDashboard = window.location.pathname === "/dashboard";
//       if (isOnDashboard) {
//         window.location.hash = targetHash;
//         window.dispatchEvent(new Event("dashboard-scroll-request"));
//       } else {
//         router.push(`/dashboard${targetHash}`);
//       }
//     }
//   }, [router]);

//   if (!user) return null;

//   return (
//     <div style={S.wrap} ref={wrapRef}>
//       <button
//         style={S.bellBtn(open)}
//         title="Notifications"
//         type="button"
//         onClick={() => setOpen((o) => !o)}
//       >
//         🔔
//         {unreadCount > 0 && <span style={S.unreadDot} />}
//       </button>

//       {open && (
//         <div style={isMobile ? S.panelMobile : S.panel}>
//           <div style={S.header}>
//             <span style={S.headerTitle}>
//               Notifications {unreadCount > 0 ? `(${unreadCount})` : ""}
//             </span>
//             {items.length > 0 && (
//               <button style={S.markAllBtn} onClick={clearAll} type="button">
//                 Clear all
//               </button>
//             )}
//           </div>

//           {items.length === 0 ? (
//             <div style={S.emptyState}>
//               <div style={{ fontSize: "1.6rem", marginBottom: 6 }}>🔔</div>
//               No notifications yet.
//             </div>
//           ) : (
//             items.map((n) => (
//               <div
//                 key={n.id}
//                 style={S.item(!n.read)}
//                 onClick={() => handleItemClick(n)}
//               >
//                 <div style={S.avatar}>
//                   {n.fromPhoto
//                     ? <img src={n.fromPhoto} alt={n.fromName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//                     : (n.fromName?.charAt(0)?.toUpperCase() || "U")}
//                 </div>
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                   <div style={S.itemText}>
//                     <span style={S.itemName}>{n.fromName}</span>{" "}
//                     {textFor(n)}
//                   </div>
//                   <div style={S.itemMeta}>
//                     {ICONS[n.type] || "🔔"} {timeAgo(n.timestamp)}
//                   </div>
//                 </div>
//                 {!n.read && <span style={S.unreadBall} />}
//               </div>
//             ))
//           )}
//         </div>
//       )}
//     </div>
//   );
// }