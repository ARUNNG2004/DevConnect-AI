import Link from "next/link";

export default function Home() {
  return (
    <main id="landing-page-view">
      <div className="glow-blob glow-blob-1"></div>
      <div className="glow-blob glow-blob-2"></div>
      <div className="glow-blob glow-blob-3"></div>

      <nav id="landing-nav">
        <Link href="/" className="logo">
          <div className="logo-icon">🧠</div>
          <span>DevConnect AI</span>
        </Link>

        <div className="nav-links" id="nav-menu">
          <a href="#features">AI Showcase</a>
          <a href="#workflow">How It Works</a>
          <a href="#stats">Dashboard</a>
          <a href="#waitlist">Waitlist</a>
          <Link href="/dashboard" className="btn-nav-cta">
            Open Community App
          </Link>
        </div>
      </nav>

      <header className="hero">
        <div className="badge">
          <span className="badge-dot"></span>
          🚀 AI-Powered Developer Community
        </div>

        <h1>
          Building the Future of <br />
          <span>Developer Collaboration</span>
        </h1>

        <p>
          DevConnect AI is a next-generation social ecosystem where engineers
          share knowledge, collaborate on repositories, and leverage contextual
          AI agents to debug errors, review pull requests, and deploy code
          faster.
        </p>

        <div className="hero-ctas">
          <Link href="/dashboard" className="btn btn-primary">
            <span>Launch Community Feed</span>
          </Link>

          <a href="#features" className="btn btn-secondary">
            Explore AI Showcase
          </a>
        </div>

        <div className="hero-mockup-wrapper">
          <div className="mockup-window">
            <div className="mockup-header">
              <div className="mockup-dots">
                <span className="mockup-dot dot-red"></span>
                <span className="mockup-dot dot-yellow"></span>
                <span className="mockup-dot dot-green"></span>
              </div>
              <div className="mockup-title">feed_app_controller.tsx</div>
              <div style={{ width: "32px" }}></div>
            </div>

            <div className="mockup-body">
              <aside className="mockup-sidebar">
                <div className="mockup-sidebar-item active"></div>
                <div className="mockup-sidebar-item"></div>
                <div className="mockup-sidebar-item"></div>
                <div
                  className="mockup-sidebar-item"
                  style={{
                    marginTop: "auto",
                    height: "32px",
                    borderRadius: "50%",
                    width: "32px",
                    background: "rgba(255,255,255,0.05)",
                  }}
                ></div>
              </aside>

              <section className="mockup-main">
                <div className="mockup-post">
                  <div className="mockup-post-header">
                    <div className="mockup-avatar"></div>
                    <div className="mockup-meta">
                      <div
                        className="mockup-line-sm"
                        style={{ width: "120px" }}
                      ></div>
                      <div
                        className="mockup-line-sm"
                        style={{ width: "70px", opacity: "0.5" }}
                      ></div>
                    </div>
                  </div>

                  <div className="mockup-code-card">
                    <span className="syn-comment">
                      // App Router re-renders infinitely on state push
                    </span>
                    <br />
                    <span className="syn-keyword">const</span> handleFilter =
                    (filter) =&gt; {"{"}
                    <br />
                    &nbsp;&nbsp;router.
                    <span className="mockup-code-highlight">push</span>(
                    <span className="syn-string">`?tab=${"{filter}"}`</span>);
                    <br />
                    {"}"}
                  </div>

                  <div className="mockup-ai-card">
                    <div className="mockup-ai-badge">
                      🤖 DevConnect Copilot
                    </div>
                    <div
                      className="mockup-line-sm"
                      style={{
                        width: "90%",
                        background: "var(--accent-purple)",
                        height: "6px",
                        marginBottom: "6px",
                      }}
                    ></div>
                    <div
                      className="mockup-line-sm"
                      style={{
                        width: "75%",
                        background: "var(--accent-purple)",
                        height: "6px",
                        opacity: "0.7",
                      }}
                    ></div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </header>

      <section className="section" id="features">
        <div className="section-title">
          <h2>
            AI Features <span>Showcase</span>
          </h2>
          <p>
            DevConnect features custom LLM orchestration running locally in your
            workspace to automate tedious code tasks.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card feature-card-ai">
            <div className="feature-icon">🤖</div>
            <h3>Auto Code Reviewer</h3>
            <p>
              Scans snippets posted in conversations, verifying memory safety,
              performance leaks, and logic regressions automatically.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Intelligent Composer</h3>
            <p>
              Helps with formatting code blocks, picking hashtags, and polishing
              technical explanations.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Smart Query Classifier</h3>
            <p>
              Categorizes discussions and routes questions to relevant topic
              maintainers and collaborators.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="workflow">
        <div className="section-title">
          <h2>
            How <span>DevConnect</span> Works
          </h2>
          <p>
            A step-by-step tour of building projects on our interactive
            collaboration timeline.
          </p>
        </div>

        <div className="workflow-container">
          <div className="workflow-step active">
            <div className="workflow-num">01</div>
            <div className="workflow-card">
              <h3>Compose Your Discussion</h3>
              <p>
                Draft coding questions, share logs, or start a repository
                collaboration using markdown, tags, and code blocks.
              </p>
            </div>
          </div>

          <div className="workflow-step">
            <div className="workflow-num">02</div>
            <div className="workflow-card">
              <h3>AI Copilot Evaluates</h3>
              <p>
                DevConnect AI suggests corrections, hashtags, and code-review
                improvements before you post.
              </p>
            </div>
          </div>

          <div className="workflow-step">
            <div className="workflow-num">03</div>
            <div className="workflow-card">
              <h3>Community Code Verification</h3>
              <p>
                Get responses from developers, resolve comments, and improve
                your projects faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="stats">
        <div className="section-title">
          <h2>
            Community <span>Statistics</span> Dashboard
          </h2>
          <p>
            Review dashboard data tracking community health and AI performance.
          </p>
        </div>

        <div className="stats-dashboard">
          <div className="stat-metric-card">
            <div className="stat-metric-val">10,482</div>
            <div className="stat-metric-label">Active Engineers</div>
          </div>

          <div className="stat-metric-card">
            <div className="stat-metric-val">52,192</div>
            <div className="stat-metric-label">AI Code Reviews</div>
          </div>

          <div className="stat-metric-card">
            <div className="stat-metric-val">4.2s</div>
            <div className="stat-metric-label">Avg Review Latency</div>
          </div>

          <div className="stat-metric-card">
            <div className="stat-metric-val">99.8%</div>
            <div className="stat-metric-label">System Uptime</div>
          </div>
        </div>
      </section>

      <section className="waitlist-section" id="waitlist">
        <h3>
          Join the <span>DevConnect Waitlist</span>
        </h3>
        <p>
          Be the first to know when registration opens for public access and
          early beta features.
        </p>

        <form className="waitlist-form">
          <input
            type="email"
            className="waitlist-input"
            placeholder="Enter your developer email..."
            required
          />
          <button type="submit" className="btn btn-primary">
            Get Early Access
          </button>
        </form>
      </section>

      <section className="cta">
        <h2>Ready to Accelerate Your Journey?</h2>
        <p>
          Join the next generation of developer workspaces powered by local code
          reviews.
        </p>
        <Link href="/dashboard" className="btn btn-primary">
          Launch Community Feed
        </Link>
      </section>

      <footer>
        <p>© 2026 DevConnect AI • Built for Modern Engineering Teams</p>
      </footer>
    </main>
  );
}