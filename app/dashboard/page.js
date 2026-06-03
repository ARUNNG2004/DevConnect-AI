import Link from "next/link";

export default function Dashboard() {
  return (
    <main id="app-dashboard-view">
      <div className="app-container">
        <header className="navbar">
          <Link href="/" className="nav-brand" title="Back to Features Tour">
            <span>🧠 DevConnect AI</span>
          </Link>

          <div className="nav-search">
            <span className="nav-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search discussions, tags, error codes..."
            />
          </div>

          <div className="nav-actions">
            <button className="btn-icon" title="AI Code Review Alerts">
              ✨
            </button>
            <button className="btn-icon" title="Notifications">
              🔔
            </button>
            <div className="user-profile-menu">
              <div className="avatar online">ME</div>
            </div>
          </div>
        </header>

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
                <Link href="/">
                  <span>ℹ️</span>
                  <span>Features Tour</span>
                </Link>
              </li>
            </ul>

            <div className="sidebar-footer-card">
              <p>
                Get instant AI reviews of your code repositories directly from
                GitHub.
              </p>
              <Link href="/#features" className="btn-sidebar-cta">
                Activate AI Copilot
              </Link>
            </div>
          </aside>

          <section className="feed-column">
            <div className="composer-card">
              <div className="composer-header">
                <div className="avatar">ME</div>

                <div className="composer-input-wrapper">
                  <textarea
                    className="composer-textarea"
                    placeholder="Share a coding question, project idea, or debugging help..."
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

                <button className="btn-post">Post Discussion</button>
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
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <article className="discussion-card" data-category="question">
                <div className="card-header">
                  <div className="author-info">
                    <div
                      className="author-avatar"
                      style={{
                        background: "linear-gradient(135deg, #ec4899, #f43f5e)",
                      }}
                    >
                      SJ
                    </div>

                    <div className="author-meta">
                      <span className="author-name">Sarah Jenkins</span>
                      <span className="author-title">
                        Staff Software Engineer • Vercel
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="category-tag">Question</span>
                    <span className="post-timestamp">2h ago</span>
                  </div>
                </div>

                <h2 className="post-title">
                  React 19 Server Components re-rendering infinitely on query
                  changes?
                </h2>

                <div className="post-body">
                  <p>
                    Hey everyone, I am hitting a strange behavior in Next.js App
                    Router. When I call router.push from a Client Component
                    inside a Server Component wrapper, it re-fetches the entire
                    page layout twice, leading to state loss.
                  </p>

                  <div className="code-block-wrapper">
                    <div className="code-header">
                      <span className="code-lang">tsx</span>
                      <button className="btn-copy-code">Copy</button>
                    </div>

                    <pre className="code-content">
                      <code>{`// app/feed/page.tsx
export default async function FeedPage({ searchParams }) {
  const data = await fetchData(searchParams.query);

  return (
    <div>
      <FilterTabs />
      <FeedList items={data.items} />
    </div>
  );
}`}</code>
                    </pre>
                  </div>

                  <p>
                    Has anyone encountered this state resetting? What is the
                    best way to handle localized page parameter updates?
                  </p>
                </div>

                <div className="post-tags">
                  <a href="#" className="post-tag">
                    #react
                  </a>
                  <a href="#" className="post-tag">
                    #nextjs
                  </a>
                  <a href="#" className="post-tag">
                    #typescript
                  </a>
                </div>

                <div className="post-actions">
                  <div className="post-actions-group">
                    <button className="btn-action btn-like">
                      ♡ <span className="like-count">42</span> Likes
                    </button>
                    <button className="btn-action btn-toggle-comments">
                      💬 <span>1 Comment</span>
                    </button>
                  </div>

                  <button className="btn-action btn-save">🔖 Save</button>
                </div>
              </article>

              <article
                className="discussion-card"
                data-category="collaboration"
              >
                <div className="card-header">
                  <div className="author-info">
                    <div
                      className="author-avatar"
                      style={{
                        background: "linear-gradient(135deg, #10b981, #059669)",
                      }}
                    >
                      ER
                    </div>

                    <div className="author-meta">
                      <span className="author-name">Elena Rostova</span>
                      <span className="author-title">
                        Core Maintainer • AetherDB
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="category-tag">Collaboration</span>
                    <span className="post-timestamp">5h ago</span>
                  </div>
                </div>

                <h2 className="post-title">
                  Looking for Rust contributors for AetherDB - Edge Vector
                  Database
                </h2>

                <div className="post-body">
                  <p>
                    We are building AetherDB, a lightweight embedded Vector
                    Database designed for Edge and IoT runtimes using Rust and
                    WebAssembly.
                  </p>

                  <p>
                    We need help implementing node quantization filters and HNSW
                    graph query indexing.
                  </p>
                </div>

                <div className="post-tags">
                  <a href="#" className="post-tag">
                    #rust
                  </a>
                  <a href="#" className="post-tag">
                    #webassembly
                  </a>
                  <a href="#" className="post-tag">
                    #database
                  </a>
                </div>

                <div className="post-actions">
                  <div className="post-actions-group">
                    <button className="btn-action btn-like">
                      ♡ <span className="like-count">89</span> Likes
                    </button>
                    <button className="btn-action btn-toggle-comments">
                      💬 <span>2 Comments</span>
                    </button>
                  </div>

                  <button className="btn-action btn-save">🔖 Save</button>
                </div>
              </article>
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
  );
}