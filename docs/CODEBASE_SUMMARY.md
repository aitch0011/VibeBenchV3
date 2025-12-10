# VibeBench One Shot - Codebase Documentation

## 1. Project Overview

**VibeBench One Shot** is a competitive "Tactical Engineering Simulator" designed to benchmark a developer's ability to "one-shot" production-ready code using AI (Gemini 3 Pro).

Unlike traditional coding tests that measure typing speed or syntax memory, VibeBench measures **Prompt Engineering**, **Architectural Intent**, and **Security Awareness**. Users write a single prompt to solve a complex domain-specific problem, and an AI Judge Panel evaluates the result.

## 2. Tech Stack

*   **Frontend Framework**: React 19 (via `index.tsx` entry point).
*   **Styling**: Tailwind CSS + Custom CSS for scrollbars and fonts (Inter / JetBrains Mono).
*   **AI Model**: Google Gemini 3 Pro (Code Generation) and Gemini 2.5 Flash (Judging).
*   **Persistence**: **Supabase (PostgreSQL)**. Replaces the previous client-side SQLite implementation.
*   **Icons**: Lucide React.
*   **Build/Run Environment**: Browser-native ES Modules (via `importmap`).

## 3. Architecture & Key Workflows

### A. The Challenge Flow
1.  **Domain Selection**: User selects a track (Frontend, Backend, Security) via `DomainSelector`.
2.  **Mission Briefing**: `ProblemCard` displays the "Mission Directive", "Tactical Constraints", and potential **Visual Intel** (simulated multimodal inputs).
3.  **The One Shot**: User enters a single text prompt.
4.  **Generation**: `geminiService` calls Gemini 3 Pro to generate the solution code.
5.  **Judging**: Three distinct AI Personas (Turbo, Maverick, Viper) evaluate the code + prompt combination.
6.  **Scoring**: Scores are aggregated, checked for plagiarism (Veto Protocol), and saved to the Cloud.

### B. The AI Judge Panel
The judging logic is centralized in `services/geminiService.ts`.

1.  **Turbo (Efficiency)**:
    *   Focus: Time complexity, code conciseness, and submission speed.
    *   Context: Penalizes slow submissions (>2 mins).

2.  **Maverick (Originality/Architecture)**:
    *   Focus: Elegance, minimalism, and intent.
    *   **The Veto Protocol**: Maverick acts as the "Anti-Cheat". If the user's prompt is a near-duplicate of the problem description, Maverick sets a `plagiarism_detected` flag, overriding the total score to 0.
    *   **Initiative Check**: Awards bonus points for hitting hidden objectives (e.g., accessibility, error handling) not explicitly asked for.

3.  **Viper (Security/Red Team)**:
    *   Focus: OWASP Top 10 vulnerabilities.
    *   Behavior: Attempts to generate "Exploit Payloads" (e.g., SQLi strings, XSS scripts). If a breach is successful, the score drops significantly.

### C. Identity Protocol
The app supports a flexible submission workflow:
*   **Anonymous (Codename)**: Users can submit scores with just a display name.
*   **GitHub Verification**: Users can optionally verify their identity against the public GitHub API to fetch their avatar and profile URL.

### D. Data Persistence (Supabase)
The app uses a cloud-hosted PostgreSQL database via Supabase.
*   **Client**: `@supabase/supabase-js`.
*   **Schema**: A `leaderboard` table stores user performance, breakdown scores, and metadata.
*   **Security**: Row Level Security (RLS) policies allow public reads/inserts but restrict updates.
*   **Connection**: Handled in `services/supabaseClient.ts` using environment variables or fallback credentials.

## 4. File Structure Overview

```text
/
├── index.html              # Entry point, loads Supabase and Tailwind
├── index.tsx               # React Root
├── App.tsx                 # Main Controller & State Machine
├── types.ts                # TypeScript Interfaces (Domain, Problem, JudgeResult)
├── constants.ts            # Configuration: Problems, Judge Personas, Hidden Targets
├── metadata.json           # App Metadata
│
├── components/
│   ├── Layout.tsx          # Main Shell (Header, Background)
│   ├── DomainSelector.tsx  # Landing page & Track Selection
│   ├── ProblemCard.tsx     # Mission Directive display
│   ├── JudgeCard.tsx       # Individual Judge Output & Score display
│   ├── Leaderboard.tsx     # Ranking Table
│   ├── FieldGuide.tsx      # Educational Modal (SWE Best Practices)
│   ├── PercentileGauge.tsx # Animated SVG Score Visualizer
│   ├── TimebombToast.tsx   # Visual Asset for Frontend Challenge
│   └── Button.tsx          # Reusable UI Element
│
├── services/
│   ├── geminiService.ts    # Google GenAI Integration (Generation & Judging)
│   ├── supabaseClient.ts   # Supabase Connection Client
│   └── db.ts               # Database Logic (Insert/Select)
│
└── docs/
    ├── CODEBASE_SUMMARY.md # This file
    └── SYSTEM_AUDIT.md     # Audit log
```

## 5. Key Constants & Data Models

### Problems (`constants.ts`)
Problems are hardcoded scenarios with specific metadata:
*   **Multimodal Capabilities**: Challenges can include `[VISUAL INTEL]` markers (e.g., "The Timebomb Protocol") to test if the user can infer functionality from visual cues like progress bars.
*   `tacticalConstraint`: Hard requirement (e.g., "Must use Portals").
*   `judgeContext`: Hidden instructions injected into the AI Judges' system prompts to guide their grading criteria.
*   `initiativeTargets`: List of hidden bonus objectives Maverick looks for.

### Judge Results (`types.ts`)
The `JudgeResult` interface handles polymorphic responses:
*   Standard: `score`, `reasoning`.
*   Security (Viper): `breach_successful`, `exploit_payload`.
*   Anti-Cheat (Maverick): `plagiarism_detected`.
