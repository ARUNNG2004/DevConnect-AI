"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function Dashboard() {
  const { user } = useAuth();

  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const postsQuery = query(
      collection(db, "posts"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const fetchedPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts(fetchedPosts);
      },
      (err) => {
        console.error(err);
        setError("Failed to load posts.");
      }
    );

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async () => {
    if (!content.trim() || !user) return;

    try {
      setPosting(true);
      setError("");

      await addDoc(collection(db, "posts"), {
        uid: user.uid,
        displayName: user.displayName || user.email || "Anonymous User",
        photoURL: user.photoURL || "",
        content: content.trim(),
        timestamp: serverTimestamp(),
        likes: 0,
        comments: [],
      });

      setContent("");
    } catch (err) {
      console.error(err);
      setError("Failed to create post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <ProtectedRoute>
      <main id="app-dashboard-view">
        <div className="app-container">
          <Navbar variant="dashboard" />

          <div className="main-layout">
            <aside className="left-sidebar">
              <ul className="sidebar-nav-list">
                <li className="sidebar-nav-item active">
                  <a href="#">
                    <span>▦</span>
                    <span>Feed</span>
                  </a>
                </li>
                <li className="sidebar-nav-item">
                  <a href="#">
                    <span>📈</span>
                    <span>Trending</span>
                  </a>
                </li>
                <li className="sidebar-nav-item">
                  <a href="#">
                    <span>❔</span>
                    <span>Questions</span>
                  </a>
                </li>
                <li className="sidebar-nav-item">
                  <a href="#">
                    <span>👥</span>
                    <span>Collaborations</span>
                  </a>
                </li>
                <li className="sidebar-nav-item">
                  <a href="#">
                    <span>🔖</span>
                    <span>Saved Posts</span>
                  </a>
                </li>
                <li className="sidebar-nav-item">
                  <a href="/">
                    <span>ℹ️</span>
                    <span>Features Tour</span>
                  </a>
                </li>
              </ul>

              <div className="sidebar-footer-card">
                <p>
                  Get instant AI reviews of your code repositories directly from
                  GitHub.
                </p>
                <a href="/#features" className="btn-sidebar-cta">
                  Activate AI Copilot
                </a>
              </div>
            </aside>

            <section className="feed-column">
              <div className="composer-card">
                <div className="composer-header">
                  <div className="avatar">
                    {user?.displayName?.charAt(0)?.toUpperCase() || "ME"}
                  </div>

                  <div className="composer-input-wrapper">
                    <textarea
                      className="composer-textarea"
                      placeholder="Share a coding question, project idea, or debugging help..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="composer-tags-input">
                  <span className="tag-badge selected">#react</span>
                  <span className="tag-badge">#rust</span>
                  <span className="tag-badge">#typescript</span>
                  <span className="tag-badge">#ai-agents</span>
                  <span className="tag-badge">#css</span>
                </div>

                {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

                <div className="composer-actions">
                  <div className="composer-tools">
                    <button className="composer-tool-btn" title="Add Image">
                      🖼️
                    </button>
                    <button className="composer-tool-btn" title="Insert Code">
                      {"</>"}
                    </button>
                  </div>

                  <label className="ai-helper-toggle">
                    <input type="checkbox" defaultChecked />
                    <div className="ai-switch"></div>
                    <span>Draft with AI Assistant</span>
                    <span className="pulse-point"></span>
                  </label>

                  <button
                    className="btn-post"
                    onClick={handleCreatePost}
                    disabled={posting || !content.trim()}
                  >
                    {posting ? "Posting..." : "Post Discussion"}
                  </button>
                </div>
              </div>

              <div className="feed-filters-bar">
                <button className="filter-tab active">Latest Feed</button>
                <button className="filter-tab">Trending</button>
                <button className="filter-tab">Questions</button>
                <button className="filter-tab">Collaborations</button>
              </div>

              <div
                id="posts-container"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                {posts.length === 0 ? (
                  <p>No posts yet. Create the first post!</p>
                ) : (
                  posts.map((post) => (
                    <article className="discussion-card" key={post.id}>
                      <div className="card-header">
                        <div className="author-info">
                          <div className="author-avatar">
                            {post.displayName?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div className="author-meta">
                            <span className="author-name">
                              {post.displayName || "Anonymous User"}
                            </span>
                            <span className="author-title">Community Member</span>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <span className="category-tag">Discussion</span>
                          <span className="post-timestamp">
                            {post.timestamp?.toDate
                              ? post.timestamp.toDate().toLocaleString()
                              : "Just now"}
                          </span>
                        </div>
                      </div>

                      <h2 className="post-title">Community Discussion</h2>

                      <div className="post-body">
                        <p>{post.content}</p>
                      </div>

                      <div className="post-tags">
                        <a href="#" className="post-tag">
                          #community
                        </a>
                      </div>

                      <div className="post-actions">
                        <div className="post-actions-group">
                          <button className="btn-action btn-like">
                            ♡ <span className="like-count">{post.likes || 0}</span>{" "}
                            Likes
                          </button>
                          <button className="btn-action btn-toggle-comments">
                            💬{" "}
                            <span>{post.comments?.length || 0} Comments</span>
                          </button>
                        </div>

                        <button className="btn-action btn-save">🔖 Save</button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <aside className="right-sidebar">
              <div className="sidebar-widget ai-promo-widget">
                <h3 className="widget-title">
                  <span>Code Review Copilot</span>
                  <span className="pulse-point"></span>
                </h3>
                <p className="ai-promo-text">
                  Let AI review your code changes, suggest performance
                  improvements, and write documentation snippets.
                </p>
                <button className="btn-ai-cta">
                  <span>Ask for AI Code Review</span>
                </button>
              </div>

              <div className="sidebar-widget">
                <h3 className="widget-title">Trending Tags</h3>
                <div className="trending-list">
                  <div className="trending-item">
                    <a href="#" className="trending-link">
                      <span>#react</span>
                      <span>240 posts</span>
                    </a>
                    <span className="trending-stats">+24 new today</span>
                  </div>
                  <div className="trending-item">
                    <a href="#" className="trending-link">
                      <span>#rust</span>
                      <span>182 posts</span>
                    </a>
                    <span className="trending-stats">+12 new today</span>
                  </div>
                  <div className="trending-item">
                    <a href="#" className="trending-link">
                      <span>#ai-agents</span>
                      <span>110 posts</span>
                    </a>
                    <span className="trending-stats">+38 new today</span>
                  </div>
                </div>
              </div>

              <div className="sidebar-widget">
                <h3 className="widget-title">Active Members</h3>
                <div className="members-list">
                  <div className="member-item">
                    <div className="member-meta">
                      <div
                        className="avatar"
                        style={{
                          width: 28,
                          height: 28,
                          fontSize: "0.75rem",
                          background: "linear-gradient(135deg, #ec4899, #f43f5e)",
                        }}
                      >
                        SJ
                      </div>
                      <div>
                        <div className="member-name">Sarah Jenkins</div>
                        <div className="member-role">Vercel</div>
                      </div>
                    </div>
                    <div className="member-status">
                      <span className="status-dot online"></span>
                      <span>Online</span>
                    </div>
                  </div>

                  <div className="member-item">
                    <div className="member-meta">
                      <div
                        className="avatar"
                        style={{
                          width: 28,
                          height: 28,
                          fontSize: "0.75rem",
                          background: "linear-gradient(135deg, #10b981, #059669)",
                        }}
                      >
                        ER
                      </div>
                      <div>
                        <div className="member-name">Elena Rostova</div>
                        <div className="member-role">AetherDB</div>
                      </div>
                    </div>
                    <div className="member-status">
                      <span className="status-dot online"></span>
                      <span>Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}