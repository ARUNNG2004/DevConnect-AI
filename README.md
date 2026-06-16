# 🧠 DevConnect AI

> **Build. Collaborate. Grow. Powered by AI.**

A next-generation developer community platform where engineers share knowledge, collaborate on code, and get AI-assisted help — all in one place.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Local Setup](#-local-setup)
- [Firebase Setup](#-firebase-setup)
- [Sarvam AI Setup](#-sarvam-ai-setup)
- [Environment Variables](#-environment-variables)
- [Running the App](#-running-the-app)
- [App Routes](#-app-routes)
- [Current Status](#-current-status)
- [Contributing](#-contributing)

---

## 🚀 Overview

DevConnect AI is a full-stack developer community platform that unifies fragmented developer workflows — discussions, Q&A, collaboration, and AI-powered drafting help — into a single ecosystem.

---

## 🎯 Problem Statement

Developers today are scattered across:
- **Discord** for community chats
- **StackOverflow** for Q&A
- **Reddit** for discussions
- **GitHub** for collaboration

There's no single platform that combines all of this with built-in AI assistance. DevConnect AI solves that.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 / CSS variables |
| Authentication | Firebase Auth (Google + GitHub OAuth) |
| Database | Firestore (Firebase) |
| Icons | lucide-react |
| Markdown Rendering | react-markdown + remark-gfm |
| AI | Sarvam AI (Chat Completions API) |

---

## ✨ Features

### 🔐 Authentication
- Sign in / Sign up via **Google OAuth**
- Sign in / Sign up via **GitHub OAuth**
- User profile auto-saved to Firestore on first login
- Protected routes — unauthenticated users redirected to `/login`

### 🧑‍💻 Community
- Developer feed with posts (create, edit, delete)
- Real-time updates via Firestore `onSnapshot`
- Like / unlike posts
- Comment system — add, edit, and delete comments
- Markdown-rendered posts and code blocks (headings, lists, inline code, fenced code blocks)
- In-line code editor for inserting formatted code snippets into posts
- Trending discussions, Questions board, Collaborations, Saved Posts (UI scaffolded)

### 🤖 AI Features
- **Draft with AI Assistant**: describe what you're stuck on, and the AI rewrites it into a clear, well-structured discussion post — including problem description, what you've tried, and what kind of help you're looking for.
  - The assistant is intentionally scoped to **only help phrase the question** — it does not solve the problem or provide answers, keeping discussions genuinely open for the community to respond to.
  - Powered by the **Sarvam AI** chat completions API via a secure server-side Next.js API route (`/api/ai-draft`).
- Code Review Copilot (UI ready, backend in progress)

---

## 📁 Project Structure

```
DevConnect-AI/
├── app/
│   ├── layout.js               # Root layout with AuthProvider
│   ├── page.js                 # Landing page (features tour)
│   ├── globals.css             # Global styles
│   ├── api/
│   │   ├── ai-draft/
│   │   │   └── route.js        # Sarvam AI-powered "Draft with AI" endpoint
│   │   └── code-review/
│   │       └── route.js        # Code review endpoint (in progress)
│   ├── dashboard/
│   │   └── page.js             # Main community feed (protected)
│   ├── login/
│   │   └── page.js             # Login with Google / GitHub
│   ├── signup/
│   │   └── page.js             # Signup with Google / GitHub
│   ├── profile/
│   │   └── page.js             # User profile page
│   └── settings/
│       └── page.js             # Settings page
├── components/
│   ├── AIDraftAssistant.js     # "Draft with AI" prompt box + Sarvam AI call
│   ├── CodeEditorModal.js      # Modal for inserting formatted code blocks
│   ├── CodeReview.js           # Code review UI component
│   ├── Navbar.js
│   ├── ProtectedRoute.js       # Auth guard — redirects to /login if not authenticated
│   ├── ScrollToTop.js
│   └── ThemeToggle.js
├── context/
│   └── AuthContext.js          # Firebase auth state (Google + GitHub login/logout)
├── lib/
│   └── firebase.js             # Firebase app initialization
├── .env.local                  # Environment variables (not committed)
├── .gitignore
├── package.json
└── README.md
```

---

## ✅ Prerequisites

Make sure you have the following installed before setting up:

- **Node.js** v18 or higher → [Download](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
- A **Firebase** account → [console.firebase.google.com](https://console.firebase.google.com)
- A **GitHub OAuth App** (for GitHub login) → [github.com/settings/developers](https://github.com/settings/developers)
- A **Sarvam AI** API key → [sarvam.ai](https://www.sarvam.ai) (for "Draft with AI Assistant")

Check your versions:
```bash
node -v
npm -v
```

---

## ⚙️ Local Setup

### 1. Fork the repository

Click the **Fork** button at the top right of this page to fork it to your GitHub account.

### 2. Clone your fork

```bash
git clone https://github.com/<your-username>/DevConnect-AI.git
cd DevConnect-AI
```

### 3. Install dependencies

```bash
npm install
```

This installs all dependencies, including `react-markdown` and `remark-gfm` used for rendering post content.

### 4. Set up Firebase (see section below)

### 5. Set up Sarvam AI (see section below)

### 6. Create your `.env.local` file

```bash
cp .env.example .env.local
```

Or create it manually and fill in your Firebase and Sarvam AI credentials (see [Environment Variables](#-environment-variables)).

### 7. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔥 Firebase Setup

### Step 1 — Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add project** → give it a name → click through setup
3. Once created, go to **Project Settings** (gear icon) → **Your Apps**
4. Click **Web (`</>`)** → register the app → copy the config object

### Step 2 — Enable Firestore

1. In the left sidebar, go to **Build → Firestore Database**
2. Click **Create database** → choose **Start in test mode** (for development)
3. Select a region → click **Done**

### Step 3 — Enable Authentication providers

1. Go to **Build → Authentication → Sign-in method**
2. Enable **Google** — click the toggle → save
3. Enable **GitHub**:
   - Go to [github.com/settings/developers](https://github.com/settings/developers)
   - Click **New OAuth App**
   - Set **Homepage URL** to `http://localhost:3000`
   - Set **Authorization callback URL** to the one shown in Firebase (e.g. `https://<your-project>.firebaseapp.com/__/auth/handler`)
   - Copy the **Client ID** and **Client Secret** back into Firebase → save

### Step 4 — Copy your Firebase config

From **Project Settings → Your Apps → SDK setup and configuration**, copy all the config values into your `.env.local`.

---

## 🤖 Sarvam AI Setup

The **Draft with AI Assistant** feature uses the [Sarvam AI](https://www.sarvam.ai) chat completions API.

1. Sign up at [sarvam.ai](https://www.sarvam.ai) and generate an API key from your dashboard.
2. Add the key to `.env.local` as `SARVAM_API_KEY` (see below).
3. The API key is used **server-side only**, via `app/api/ai-draft/route.js` — it is never exposed to the browser.
4. If you see a `model deprecated` error, check Sarvam's docs for the current supported model names (e.g. `sarvam-30b`, `sarvam-105b`) and update the `model` field in `route.js` accordingly.

> ⚠️ Never commit your Sarvam API key. If a key is ever accidentally committed or shared, rotate it immediately from the Sarvam dashboard.

---

## 🔑 Environment Variables

Create a `.env.local` file in the root of the project with the following keys:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=abcname
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=deafult

# Sarvam AI (server-side only — do NOT prefix with NEXT_PUBLIC_)
SARVAM_API_KEY=your_sarvam_api_key
```

> ⚠️ Never commit `.env.local` to Git. It is already added to `.gitignore`.
>
> Restart your dev server (`npm run dev`) after adding or changing any environment variable — Next.js only loads `.env.local` on startup.

All Firebase values are available in **Firebase Console → Project Settings → Your Apps → SDK config**.

---

## ▶️ Running the App

| Command | Description |
|---|---|
| `npm run dev` | Start development server at `localhost:3000` |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🗺️ App Routes

| Route | Description | Protected |
|---|---|---|
| `/` | Landing page with features tour | No |
| `/login` | Login with Google or GitHub | No |
| `/signup` | Signup with Google or GitHub | No |
| `/dashboard` | Main community feed | ✅ Yes |
| `/profile` | User profile page | ✅ Yes |
| `/settings` | Settings page | ✅ Yes |
| `/api/ai-draft` | Server-side Sarvam AI draft endpoint | N/A (API route) |

> Protected routes automatically redirect unauthenticated users to `/login`.

---

## 🚧 Current Status

This project is under active development. Here's what's done and what's still in progress:

| Feature | Status |
|---|---|
| Landing page UI | ✅ Done |
| Google OAuth login/signup | ✅ Done |
| GitHub OAuth login/signup | ✅ Done |
| User saved to Firestore on first login | ✅ Done |
| Protected routes | ✅ Done |
| Dashboard UI (feed, sidebar, layout) | ✅ Done |
| Firestore CRUD for posts | ✅ Done |
| Like system | ✅ Done |
| Comment system (add/edit/delete) | ✅ Done |
| Real-time updates | ✅ Done |
| Markdown rendering for posts (headings, lists, code blocks) | ✅ Done |
| In-post code editor / inserter | ✅ Done |
| **Draft with AI Assistant** (Sarvam AI, question-only mode) | ✅ Done |
| AI Code Review (Copilot) | 🔄 In Progress |
| User profile page | 🔜 Planned |
| Trending / Questions / Collaborations / Saved Posts (functional) | 🔜 Planned |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

### 1. Fork and clone (as above)

### 2. Create a feature branch

```bash
git checkout -b feat/your-feature-name
# or for fixes:
git checkout -b fix/issue-description
# or for docs:
git checkout -b docs/what-you-updated
```

### 3. Make your changes and commit

```bash
git add .
git commit -m "feat: add post creation to dashboard"
```

Follow this commit convention:
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation changes
- `style:` — formatting, no logic change
- `refactor:` — code restructure, no feature change
- `chore:` — dependency updates, config changes

### 4. Push and open a PR

```bash
git push origin feat/your-feature-name
```

Then open a Pull Request against the `main` branch of the original repo. In your PR description, reference the issue it closes:

```
Closes #<issue-number>
```

---

## 📄 License

ISC License — see [LICENSE](./LICENSE) for details.

---

<p align="center">Made with ❤️ for the developer community</p>