// ── Helpers ───────────────────────────────────────────────────────────────────

function parseUsername(githubUrl) {
  try {
    const url = new URL(githubUrl.trim());
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0] || null;
  } catch {
    // bare username passed directly
    const clean = githubUrl.trim().replace(/^@/, "");
    if (/^[a-zA-Z0-9-]+$/.test(clean)) return clean;
    return null;
  }
}

function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function analyseRepos(repos) {
  const stats = {
    total: repos.length,
    noDescription: 0,
    noReadme: 0,          // approximated by has_wiki heuristic + size
    tinySize: 0,          // size < 10 KB — almost certainly empty/placeholder
    noHomepage: 0,
    noLicense: 0,
    forkGraveyard: 0,     // forked but never committed (no way to check commits, use size=0 proxy)
    graveyardRepos: [],   // old + empty + no description + no homepage
    solidRepos: [],       // has description + homepage + not too old
    languageCounts: {},
    longestInactive: { name: "", days: 0 },
    genericNames: 0,
  };

  const GENERIC = ["test", "project", "my-app", "untitled", "demo", "practice",
                   "learning", "tutorial", "temp", "playground", "scratch", "todo",
                   "hello-world", "first", "example", "sample", "new-repo"];

  repos.forEach((repo) => {
    const daysSincePush = daysSince(repo.pushed_at);
    const isTiny = (repo.size || 0) < 10;
    const hasDesc = !!(repo.description && repo.description.trim());
    const hasHome = !!(repo.homepage && repo.homepage.trim());
    const hasLicense = !!(repo.license);
    const isFork = repo.fork;

    // Count issues
    if (!hasDesc) stats.noDescription++;
    if (!hasHome) stats.noHomepage++;
    if (!hasLicense) stats.noLicense++;
    if (isTiny) stats.tinySize++;
    if (isFork && isTiny) stats.forkGraveyard++;

    // Language counts (skip forks to avoid inflating)
    if (repo.language && !isFork) {
      stats.languageCounts[repo.language] = (stats.languageCounts[repo.language] || 0) + 1;
    }

    // Generic name check
    const nameLower = repo.name.toLowerCase().replace(/-/g, "");
    if (GENERIC.some((g) => nameLower.includes(g.replace(/-/g, "")))) {
      stats.genericNames++;
    }

    // Longest inactive
    if (daysSincePush > stats.longestInactive.days) {
      stats.longestInactive = { name: repo.name, days: daysSincePush };
    }

    // Graveyard: old + tiny + no description + no homepage
    // This is "unfinished/abandoned" not just "done and at rest"
    if (daysSincePush > 180 && isTiny && !hasDesc && !hasHome) {
      stats.graveyardRepos.push(repo.name);
    }

    // Solid: has description AND homepage AND pushed recently OR has stars
    if (hasDesc && (hasHome || repo.stargazers_count > 0)) {
      stats.solidRepos.push({ name: repo.name, stars: repo.stargazers_count, homepage: repo.homepage });
    }
  });

  // Top languages
  stats.topLanguage = Object.entries(stats.languageCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";

  return stats;
}

function buildPrompt(username, profile, stats) {
  const graveyardList = stats.graveyardRepos.slice(0, 5).join(", ") || "none";
  const solidList = stats.solidRepos
    .slice(0, 3)
    .map((r) => `${r.name}${r.stars > 0 ? ` (⭐${r.stars})` : ""}${r.homepage ? " [has live demo]" : ""}`)
    .join(", ") || "none";

  return `You are a witty but constructive code mentor doing a "GitHub Reality Check" roast.

Developer profile:
- Username: ${username}
- Public repos: ${stats.total}
- Followers: ${profile.followers || 0}
- Most used language: ${stats.topLanguage}
- Account created: ${profile.created_at ? new Date(profile.created_at).getFullYear() : "unknown"}

Problem areas found:
- Repos with no description: ${stats.noDescription} out of ${stats.total}
- Repos with no homepage/demo link: ${stats.noHomepage} out of ${stats.total}
- Repos with no license: ${stats.noLicense} out of ${stats.total}
- Tiny/empty repos (< 10KB, likely abandoned starters): ${stats.tinySize}
- Fork graveyards (forked but never contributed): ${stats.forkGraveyard}
- Generic/placeholder repo names (test, todo, my-app, etc.): ${stats.genericNames}
- Graveyard repos (old + empty + no description + no demo): ${graveyardList}
- Longest inactive repo: "${stats.longestInactive.name}" not pushed to in ${stats.longestInactive.days} days

Bright spots:
- Repos with description + homepage or stars (actually solid projects): ${solidList}

Instructions:
1. Write a SHORT punchy roast (3-4 sentences max) that's funny but kind. Reference specific numbers. Do NOT roast repos that have been quiet but are clearly polished (those go in bright spots).
2. Then write exactly 4 specific actionable improvements titled "🔧 Fixes That Will Actually Help:" as a numbered list. Each improvement must be concrete and reference the actual stats above.
3. End with one encouraging sentence.

Use emojis. Be like a senior dev friend giving honest feedback over coffee, not a corporate performance review. Write as much as needed to cover all 4 improvements properly.`;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req) {
  const { githubUrl } = await req.json();

  if (!githubUrl) {
    return Response.json({ error: "GitHub URL is required." }, { status: 400 });
  }

  const username = parseUsername(githubUrl);
  if (!username) {
    return Response.json({ error: "Could not parse a valid GitHub username from that URL." }, { status: 400 });
  }

  // GitHub API headers
  const ghHeaders = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}),
  };

  try {
    // Fetch profile + repos in parallel
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers: ghHeaders }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`, { headers: ghHeaders }),
    ]);

    if (profileRes.status === 404) {
      return Response.json({ error: `GitHub user "${username}" not found.` }, { status: 404 });
    }
    if (profileRes.status === 403 || reposRes.status === 403) {
      return Response.json({ error: "GitHub API rate limit hit. Please try again later." }, { status: 429 });
    }
    if (!profileRes.ok || !reposRes.ok) {
      return Response.json({ error: "Failed to fetch GitHub data." }, { status: 502 });
    }

    const [profile, repos] = await Promise.all([profileRes.json(), reposRes.json()]);

    if (!Array.isArray(repos) || repos.length === 0) {
      return Response.json({ error: "This GitHub account has no public repositories to analyse." }, { status: 400 });
    }

    const stats = analyseRepos(repos);
    const prompt = buildPrompt(username, profile, stats);

    // Call Sarvam AI
    const aiRes = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": process.env.SARVAM_API_KEY,
      },
      body: JSON.stringify({
        model: "sarvam-30b",
        max_tokens: 2048,
        messages: [
          { role: "system", content: "You are a witty but constructive senior developer doing GitHub profile reviews." },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return Response.json({ error: `AI service error: ${errText}` }, { status: 502 });
    }

    const aiData = await aiRes.json();
    const roast = aiData.choices?.[0]?.message?.content || "";

    return Response.json({
      username,
      avatar: profile.avatar_url,
      stats: {
        total: stats.total,
        noDescription: stats.noDescription,
        noHomepage: stats.noHomepage,
        noLicense: stats.noLicense,
        tinySize: stats.tinySize,
        forkGraveyard: stats.forkGraveyard,
        genericNames: stats.genericNames,
        graveyardRepos: stats.graveyardRepos,
        solidRepos: stats.solidRepos,
        topLanguage: stats.topLanguage,
        longestInactive: stats.longestInactive,
      },
      roast,
    });
  } catch (err) {
    console.error("github-roast error:", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}