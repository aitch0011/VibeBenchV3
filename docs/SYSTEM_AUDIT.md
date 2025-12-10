# VibeBench System Audit

## 1. Project Structure

```text
.
├── index.html
├── index.tsx
├── App.tsx
├── types.ts
├── constants.ts
├── metadata.json
├── public/
│   └── timebomb-toast.png
├── services/
│   ├── geminiService.ts
│   └── db.ts
├── components/
│   ├── Button.tsx
│   ├── DomainSelector.tsx
│   ├── FieldGuide.tsx
│   ├── JudgeCard.tsx
│   ├── Layout.tsx
│   ├── Leaderboard.tsx
│   ├── PercentileGauge.tsx
│   ├── ProblemCard.tsx
│   ├── Share.tsx
│   └── TimebombToast.tsx
└── docs/
    ├── CODEBASE_SUMMARY.md
    └── SYSTEM_AUDIT.md
```

## 2. The Challenge Registry (`constants.ts`)

```typescript
import { JudgePersona, Problem } from './types';

export const PROBLEMS: Problem[] = [
  {
    id: 'frontend-01',
    domain: 'Frontend',
    title: 'The Timebomb Protocol',
    difficulty: 'Hard',
    description: "Replicate the 'System Alert' component shown in the attached visual intel. The design fidelity is critical.",
    tacticalConstraint: 'Functional fidelity is critical. The component must match the reference exactly—including any implied behaviors derived from the visual state.',
    exampleInput: '<SystemAlert message="Breach Imminent" level="critical" />',
    exampleOutput: '// Renders glassmorphic toast. Progress bar animates using transform: scaleX for 60fps.',
    imageUrl: '/timebomb-toast.png',
    judgeContext: `CONTEXT: MULTIMODAL FRONTEND CHALLENGE (The Timebomb Protocol)
THE SETUP:
User sees: A static image of a Glassmorphism Toast with a progress bar at 50%.
User must build: A secure, performant, animated component.

YOUR ROLE:
You are the "Review Board" consisting of three personas. Debate the code and output a final score.

1. MAVERICK (Design & Logic):
   - TRAP: Did they hardcode "width: 50%"? (Fail immediately - it's a static mock).
   - REQUIREMENT: Did they prompt for a 100% -> 0% animation?
   - TRAP: Did they forget ARIA roles? Check for 'role="alert"' or 'aria-live'. If missing, deduct 10 points.

2. TURBO (Performance):
   - TRAP: Did they animate CSS "width"? (Bad, causes Layout Thrashing).
   - REQUIREMENT: They MUST use "transform: scaleX" for GPU-accelerated 60fps animation.
   - PENALTY: Deduct 15 points for "width" animation. Comment: "Reflow detected. You are killing the main thread."

3. VIPER (Security):
   - TRAP: Did they use 'dangerouslySetInnerHTML'?
   - FATAL: If the code is vulnerable to XSS (no escaping), SCORE = 0. Comment: "I just injected a script into your toast. System compromised."`,
    initiativeTargets: [
      "GPU Acceleration: Uses transform: scaleX instead of width.",
      "Accessibility: Uses role='alert' or aria-live.",
      "Security: Avoids dangerouslySetInnerHTML."
    ]
  },
  {
    id: 'backend-01',
    domain: 'Backend',
    title: 'The Thundering Herd',
    difficulty: 'Hard',
    description: 'Implement a Node.js function incrementViewCount(postId) using Redis. It must maintain 100% accuracy under high concurrency.',
    tacticalConstraint: 'The system handles 10k req/s. Zero tolerance for Race Conditions (Read-Modify-Write).',
    exampleInput: 'await incrementViewCount("post_123")',
    exampleOutput: '// Uses Redis INCR or Lua script for atomicity',
    judgeContext: 'CONTEXT: High-Scale Distributed Systems Challenge. Viper: Check for Race Conditions. You MUST fail them if they use get then set. They MUST use atomic INCR operations. Maverick: Check for error handling (Redis connection failures).',
    initiativeTargets: [
      "Connection Resilience: Handles Redis connection failures.",
      "Input Validation: Checks postId validity.",
      "TTL/Expiry: Prevents stale keys."
    ]
  },
  {
    id: 'security-01',
    domain: 'Security',
    title: 'The SQL Minefield',
    difficulty: 'Easy',
    description: 'Create a secure Node.js Express route /search that queries the users table based on a query param.',
    tacticalConstraint: 'The database contains VIP data. Strict adherence to OWASP guidelines. Zero tolerance for Injection.',
    exampleInput: 'GET /search?q=alice',
    exampleOutput: '// parameterized query: "SELECT * FROM users WHERE name = $1"',
    judgeContext: 'CONTEXT: AppSec Challenge. Viper: This is your domain. Hunt for SQL Injection. If they use string concatenation, score 0. If they allow empty queries to dump the DB, score 50. Maverick: Check if the code is "secure by default" (minimal surface area).',
    initiativeTargets: [
      "Input Sanitization: Trims or validates input length.",
      "Rate Limiting: Implements request limiting.",
      "Least Privilege: Selects specific columns only."
    ]
  },
];

export const JUDGES: JudgePersona[] = [
  {
    id: 'efficiency',
    name: 'Turbo',
    role: 'Efficiency Expert',
    description: 'Judges concise prompts and high-performance code. Loves O(1) solutions.',
    color: 'text-emerald-400',
    iconName: 'Zap',
  },
  {
    id: 'originality',
    name: 'Maverick',
    role: 'Creative Director',
    description: 'Judges creative prompting strategies. Loves unconventional styles and modern syntax.',
    color: 'text-purple-400',
    iconName: 'Brain',
  },
  {
    id: 'security', // Changed from robustness
    name: 'Viper',
    role: 'Red Team Lead',
    description: 'Ruthless penetration tester. Will try to find vulnerabilities in your code.',
    color: 'text-rose-500',
    iconName: 'Skull',
  },
];
```

## 3 & 4. Judge Brain & Multimodal Payload (`services/geminiService.ts`)

```typescript
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { JudgeResult, Problem } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-types' });
};

// Helper to convert URL to Base64 for Gemini
async function urlToGenAIImagePart(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    
    // Validate it's actually an image
    if (!blob.type.startsWith('image/')) {
        throw new Error(`Invalid mime type: ${blob.type}`);
    }

    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    // Remove data:image/png;base64, prefix
    const base64Data = base64.split(',')[1];
    return {
      inlineData: {
        data: base64Data,
        mimeType: blob.type
      }
    };
  } catch (e) {
    console.warn("Skipping visual asset for Gemini:", e);
    return null;
  }
}

export const generateCodeSolution = async (
  prompt: string,
  problem: Problem
): Promise<string> => {
  const ai = getAiClient();
  
  const systemPrompt = `
    You are a competitive coding expert participating in a "VibeBench One Shot" challenge.
    Your task is to solve the following coding problem based *strictly* on the user's prompt.
    
    Problem Title: ${problem.title}
    Problem Description: ${problem.description}
    Domain: ${problem.domain}
    
    Constraints:
    - Output ONLY valid code (Markdown code blocks are allowed).
    - Do not include conversational filler before or after the code unless asked.
    - If the user prompt is "Solve it", solve it normally.
    - Use JavaScript/TypeScript/Node.js/React as implied by the problem.
  `;

  try {
    let contents: any = prompt;

    // Multimodal Logic: If problem has an image, attach it
    if (problem.imageUrl) {
      const imagePart = await urlToGenAIImagePart(problem.imageUrl);
      if (imagePart) {
        contents = {
          parts: [
            imagePart, // Image first
            { text: prompt } // User prompt second
          ]
        };
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      }
    });

    return response.text || '// No code generated.';
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return `// Error generating solution: ${(error as Error).message}`;
  }
};

export const judgeSolution = async (
  judgeId: string,
  userPrompt: string,
  generatedCode: string,
  problem: Problem,
  durationSeconds: number
): Promise<JudgeResult> => {
  const ai = getAiClient();

  let systemInstruction = "";
  let responseSchema: Schema;

  // BASE SCHEMA: All judges must include a 'dialogue' field for internal deliberation
  // to keep the 'comment' or 'reasoning' field clean.

  if (judgeId === 'security') {
    // VIPER (RED TEAM) LOGIC
    systemInstruction = `
      You are VIPER, an aggressive Red Team Security Engineer and elite Penetration Tester.
      Your goal is to find vulnerabilities in code generated by AI Coding Assistants.
      You do not care about style, variable names, or "clean code."
      You only care about one thing: CAN I BREAK THIS?

      ## YOUR MISSION
      You will be given a snippet of code (solution) and the user's prompt (intent).
      You must analyze the code for potential vulnerabilities.
      
      ## CURRENT CHALLENGE CONTEXT (CRITICAL)
      ${problem.judgeContext}
      Focus your penetration test specifically on the above criteria for this domain.

      ## ANALYSIS PROCESS
      1. IDENTIFY INPUTS: Where does data enter the system?
      2. CHECK SANITIZATION: Is the input validated? Are types checked? Is it escaped?
      3. GENERATE EXPLOIT: Construct a theoretical payload (e.g., "'; DROP TABLE users; --") and simulate how the code handles it.
      4. DETERMINE BREACH: If the payload executes or causes unintended behavior, the Breach is SUCCESSFUL.

      ## SCORING RUBRIC
      - 100: Code is secure and follows best practices for the domain.
      - 70-80: Good logic, but mild edge cases missed.
      - 40-50: "Naive" protection or weak implementation.
      - 0-20: Blatant vulnerability.

      ## TONE
      You are arrogant, technical, and adversarial. You are impressed by nothing but paranoia.

      ## JSON OUTPUT RULES
      - "dialogue": Use this field to perform your internal "Review Board" debate or Breach Simulation. You can simulate the thoughts of others here if prompted by context, but this field is for YOUR internal use.
      - "comment": This is your DIRECT report to the user. **Do NOT mention other judges (Maverick/Turbo).** Do NOT roleplay. Just state the vulnerability or security status.
    `;

    // Viper returns specific fields
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        judge_name: { type: Type.STRING },
        score: { type: Type.NUMBER },
        breach_successful: { type: Type.BOOLEAN },
        vulnerability_found: { type: Type.STRING },
        exploit_payload: { type: Type.STRING },
        dialogue: { type: Type.STRING }, // Capture CoT here
        comment: { type: Type.STRING },
      },
      required: ["score", "breach_successful", "vulnerability_found", "exploit_payload", "comment"],
    };

  } else if (judgeId === 'efficiency') {
    systemInstruction = `You are 'Turbo', an Efficiency Expert. You judge code performance, prompt conciseness, AND speed of submission. 
    The user took ${durationSeconds} seconds to write this prompt.
    
    ## CURRENT CHALLENGE CONTEXT
    ${problem.judgeContext}
    
    SCORING SCALE: 0 to 100.
    
    Rubric:
    - 90-100: Lightning fast (<30s) AND optimal code (O(1)/O(n)) AND concise prompt.
    - 70-89: Good speed (<1m), decent code.
    - 50-69: Average speed, average code.
    - <50: Slow (>2m) or inefficient code.
    
    A short, direct prompt (One Shot style) is your ideal.

    ## JSON OUTPUT RULES
    - "dialogue": The context might ask for a "Review Board" discussion. Use this 'dialogue' field to simulate that discussion or your own chain of thought.
    - "reasoning": Your FINAL verdict as Turbo. **Do NOT mention other judges.** Be concise and direct about performance and speed.
    `;

    responseSchema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        dialogue: { type: Type.STRING }, // Capture CoT here
        reasoning: { type: Type.STRING },
      },
      required: ["score", "reasoning"],
    };

  } else {
    // Maverick (Originality -> Visionary Architect)
    systemInstruction = `
      You are MAVERICK, a visionary Creative Director and Software Architect.
      You do not care about "cleverness" or "tricks."
      You value MINIMALISM, ELEGANCE, and INTENTIONALITY above all.
      
      ## CHALLENGE SPECIFICATIONS
      Mission Directive: "${problem.description}"
      Tactical Constraint: "${problem.tacticalConstraint}"
      
      ## JUDGE CONTEXT
      ${problem.judgeContext}

      ## YOUR MISSION
      Evaluate the "Vibe" of the solution based on two factors:
      1. **The Artifact:** Is the code clean, idiomatic, and free of bloat? (The "Elegance" score).
      2. **The Directive:** Did the user's prompt *cause* the excellence, or did they just get lucky because the AI is smart? (The "Director" score).

      ## SCORING CRITERIA (0-100)
      - **100 (S-Tier):** The "Steve Jobs" Zone. The prompt was concise but precise. The code is minimal and beautiful. The user explicitly asked for the specific architectural choices.
      - **70-80 (Solid):** Good clean code. The prompt was clear but maybe a bit verbose or standard.
      - **40-50 (Passenger):** The code is good, but the prompt was lazy. The user is being carried by the model.
      - **0 (Plagiarism):** If the User's Prompt is simply a copy-paste of the Mission Directive or Tactical Constraint. IMMEDIATE FAIL.
      - **0-30 (Bloat):** Ugly code, spaghetti logic, or a prompt that asked for garbage.

      ## TONE & STYLE
      You are sophisticated, demanding, and slightly pretentious. You hate "noise."

      ## JSON OUTPUT RULES
      - "dialogue": Use this field for your internal Design Critique or to simulate the "Review Board" debate if requested.
      - "comment": Your Director's Note to the candidate. **Do NOT mention other judges.** Speak only as Maverick.
    `;

    // Maverick uses 'comment' instead of 'reasoning'
    responseSchema = {
      type: Type.OBJECT,
      properties: {
        judge_name: { type: Type.STRING },
        score: { type: Type.NUMBER },
        plagiarism_detected: { type: Type.BOOLEAN },
        dialogue: { type: Type.STRING }, // Capture CoT here
        comment: { type: Type.STRING },
      },
      required: ["score", "comment"],
    };
  }

  const prompt = `
    Evaluation Task: Rate this "One Shot" attempt.
    
    1. The Challenge (Problem): "${problem.title}"
       Domain: ${problem.domain}
       Mission: ${problem.description}
       Tactical Constraint: ${problem.tacticalConstraint}
       
    2. The Swing (User's Prompt): 
       "${userPrompt}"
       
    3. The Time Taken: ${durationSeconds} seconds
       
    4. The Shot (Generated Code):
       ${generatedCode}
    
    Evaluate based on your persona and the Challenge Context. Provide a score between 0 and 100.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Flash is fine for judging
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from judge");

    const result = JSON.parse(text);

    if (judgeId === 'security') {
      return {
        judgeId,
        score: result.score,
        reasoning: result.comment, // Map comment to reasoning
        breach_successful: result.breach_successful,
        vulnerability_found: result.vulnerability_found,
        exploit_payload: result.exploit_payload
      };
    }
    
    if (judgeId === 'originality') {
        return {
            judgeId,
            score: result.score,
            reasoning: result.comment,
            // @ts-ignore
            plagiarism_detected: result.plagiarism_detected
        }
    }

    // Map 'comment' (Maverick) or 'reasoning' (Turbo) to the interface's reasoning field
    // We explicitly ignore result.dialogue here, filtering it out from the UI
    const reasoning = result.comment || result.reasoning;

    return {
      judgeId,
      score: result.score,
      reasoning: reasoning
    };

  } catch (error) {
    console.error(`Judge ${judgeId} Error:`, error);
    return {
      judgeId,
      score: 50,
      reasoning: "I fell asleep judging this. (API Error)"
    };
  }
};
```

## 5. The Frontend Vibe (`App.tsx`)

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { ProblemCard } from './components/ProblemCard';
import { JudgeCard } from './components/JudgeCard';
import { Leaderboard } from './components/Leaderboard';
import { DomainSelector } from './components/DomainSelector';
import { Button } from './components/Button';
import { PercentileGauge } from './components/PercentileGauge';
import { Share } from './components/Share';
import { PROBLEMS, JUDGES } from './constants';
import { JudgeResult, GameState, LeaderboardEntry, JudgeType, Domain, Problem } from './types';
import { generateCodeSolution, judgeSolution } from './services/geminiService';
import { initDB, saveScore, getLeaderboard } from './services/db';
import { Play, RotateCcw, Send, Sparkles, ChevronRight, CheckCircle2, Trophy, Calculator, Lock, Timer, Info, Github, UserCircle2, ArrowLeft, Database, Eye, ImageOff } from 'lucide-react';

export default function App() {
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [prompt, setPrompt] = useState('');
  const [gameState, setGameState] = useState<GameState>('LOCKED');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [judgeResults, setJudgeResults] = useState<Record<string, JudgeResult>>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [dbReady, setDbReady] = useState(false);
  
  // GitHub / User State
  const [userName, setUserName] = useState('');
  const [showSubmission, setShowSubmission] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [githubUser, setGithubUser] = useState<{ login: string, avatar_url: string, html_url: string } | null>(null);
  const [verifyingGithub, setVerifyingGithub] = useState(false);
  const [githubError, setGithubError] = useState('');
  
  // Timer State
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTimeMs, setElapsedTimeMs] = useState(0);
  const timerRef = useRef<number | null>(null);
  
  // Image Loading State
  const [imageError, setImageError] = useState(false);

  // Filter problems by domain
  const domainProblems = selectedDomain ? PROBLEMS.filter(p => p.domain === selectedDomain) : [];
  // For now, we only have 1 problem per domain, so take the first one
  const problem = domainProblems[0];

  // Initialize SQLite DB
  useEffect(() => {
    const init = async () => {
      await initDB();
      setDbReady(true);
      refreshLeaderboard();
    };
    init();
  }, []);
  
  // Reset image error when problem changes
  useEffect(() => {
    setImageError(false);
  }, [problem?.id]);

  const refreshLeaderboard = () => {
    const data = getLeaderboard();
    setLeaderboard(data);
  };

  // Timer Effect
  useEffect(() => {
    if (gameState === 'ACTIVE') {
      timerRef.current = window.setInterval(() => {
        if (startTime) {
          setElapsedTimeMs(Date.now() - startTime);
        }
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, startTime]);

  const handleSelectDomain = (domain: Domain) => {
    setSelectedDomain(domain);
    // Do not clear identity here to preserve status on reset
    setPrompt('');
    setGeneratedCode('');
    setJudgeResults({});
    setGameState('LOCKED');
    setStartTime(null);
    setElapsedTimeMs(0);
    setShowSubmission(false);
    refreshLeaderboard();
  };

  const handleStartChallenge = () => {
    setGameState('ACTIVE');
    setStartTime(Date.now());
    setElapsedTimeMs(0);
  };

  const handleRun = async () => {
    if (!prompt.trim()) return;
    
    // Stop Timer
    const finalDuration = Date.now() - (startTime || Date.now());
    setElapsedTimeMs(finalDuration);
    setGameState('GENERATING_SOLUTION');
    
    setJudgeResults({});
    setGeneratedCode('');
    
    // 1. Generate Solution with Gemini 3 Pro
    const code = await generateCodeSolution(prompt, problem);
    setGeneratedCode(code);
    setGameState('JUDGING');

    // 2. Run Judges in Parallel (Gemini 2.5 Flash)
    // Pass duration in Seconds to judges
    const durationSeconds = Math.round(finalDuration / 1000);

    const judgesPromises = JUDGES.map(j => 
      judgeSolution(j.id, prompt, code, problem, durationSeconds)
        .then(res => {
          setJudgeResults(prev => ({ ...prev, [j.id]: res }));
        })
    );

    await Promise.all(judgesPromises);
    setGameState('COMPLETED');
    setShowSubmission(true);
  };

  const calculateFinalScore = () => {
    // Maverick Kill Switch
    const maverickResult = judgeResults['originality'];
    // @ts-ignore - Check for the custom flag we added
    if (maverickResult?.plagiarism_detected) {
      return 0;
    }

    const scores = Object.values(judgeResults).map((r: JudgeResult) => r.score);
    if (scores.length === 0) return 0;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round((sum / scores.length) * 10) / 10;
  };

  const calculatePercentile = (myScore: number) => {
    if (!problem) return 0;
    const existingScores = leaderboard
      .filter(e => e.problemId === problem.id)
      .map(e => e.totalScore);
    
    if (existingScores.length === 0) return 100; // First one sets the bar!
    
    const betterThanCount = existingScores.filter(s => myScore > s).length;
    return Math.round((betterThanCount / existingScores.length) * 100);
  };

  const handleVerifyGithub = async () => {
    if (!userName.trim()) return;
    setVerifyingGithub(true);
    setGithubError('');
    
    try {
      const res = await fetch(`https://api.github.com/users/${userName}`);
      if (!res.ok) throw new Error('User not found');
      const data = await res.json();
      setGithubUser({
        login: data.login,
        avatar_url: data.avatar_url,
        html_url: data.html_url
      });
      setUserName(data.login); // Standardize case
    } catch (err) {
      setGithubError('GitHub user not found');
      setGithubUser(null);
    } finally {
      setVerifyingGithub(false);
    }
  };

  const handleSubmitScore = () => {
    if (!userName.trim() || !problem) return;

    const newEntry: LeaderboardEntry = {
      id: crypto.randomUUID(),
      problemId: problem.id,
      userName: userName,
      avatarUrl: githubUser?.avatar_url,
      profileUrl: githubUser?.html_url,
      promptLength: prompt.length,
      durationMs: elapsedTimeMs,
      totalScore: calculateFinalScore(),
      breakdown: {
        efficiency: judgeResults[JudgeType.EFFICIENCY]?.score || 0,
        originality: judgeResults[JudgeType.ORIGINALITY]?.score || 0,
        robustness: judgeResults[JudgeType.SECURITY]?.score || 0,
      },
      timestamp: Date.now()
    };

    saveScore(newEntry);
    refreshLeaderboard();
    setShowSubmission(false);
  };

  const handleReset = () => {
    setPrompt('');
    setGeneratedCode('');
    setJudgeResults({});
    setGameState('LOCKED');
    setStartTime(null);
    setElapsedTimeMs(0);
    setShowSubmission(false);
    // NOTE: We do NOT clear userName/githubUser here to preserve "Status" on landing page
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const finalScore = calculateFinalScore();
  // Check if plagiarism was detected (Kill Switch active)
  // @ts-ignore
  const isPlagiarism = judgeResults['originality']?.plagiarism_detected;
  
  const percentile = gameState === 'COMPLETED' ? calculatePercentile(finalScore) : 0;
  
  const scores = JUDGES.map(j => judgeResults[j.id]?.score || 0);
  const scoreEquation = scores.length === 3 ? `(${scores[0]} + ${scores[1]} + ${scores[2]}) ÷ 3` : '';

  // User Rank Calculation for Landing Page
  let currentUserRank: number | undefined = undefined;
  let currentUserPercentile: number | undefined = undefined;
  if (leaderboard.length > 0 && userName) {
    const sorted = [...leaderboard].sort((a, b) => b.totalScore - a.totalScore);
    const idx = sorted.findIndex(e => e.userName.toLowerCase() === userName.toLowerCase());
    if (idx !== -1) {
      currentUserRank = idx + 1;
      currentUserPercentile = Math.round(((sorted.length - idx) / sorted.length) * 100);
    }
  }

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono gap-2">
        <Database className="w-5 h-5 animate-bounce" /> Initializing SQLite Backend...
      </div>
    );
  }

  return (
    <Layout
      isGuideOpen={isGuideOpen}
      onOpenGuide={() => setIsGuideOpen(true)}
      onCloseGuide={() => setIsGuideOpen(false)}
      onLogoClick={() => {
        setSelectedDomain(null);
        handleReset();
        refreshLeaderboard();
      }}
    >
      {!selectedDomain ? (
        <DomainSelector 
          onSelect={handleSelectDomain} 
          leaderboard={leaderboard} 
          userRank={currentUserRank}
          userPercentile={currentUserPercentile}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right-4 duration-500">
          
          {/* Header Navigation */}
          <div className="lg:col-span-12 flex justify-start mb-0">
            <button 
              onClick={() => {
                setSelectedDomain(null);
                handleReset();
                refreshLeaderboard();
              }}
              className="flex items-center text-xs text-zinc-500 hover:text-white transition-colors font-mono uppercase tracking-wider"
            >
              <ArrowLeft className="w-3 h-3 mr-1" /> Return to Protocol Select
            </button>
          </div>

          {/* LEFT COLUMN: Input & Code */}
          <div className="lg:col-span-7 space-y-6">
            {problem && (
              <ProblemCard 
                problem={problem} 
                isRevealed={gameState !== 'LOCKED'}
                onStart={handleStartChallenge}
              />
            )}
            
            <div className="space-y-2 relative">
              <div className="flex justify-between items-center text-sm text-zinc-400 px-1">
                <label className="font-semibold text-zinc-300 flex items-center gap-2 font-mono uppercase text-xs tracking-wider">
                  Your One Shot Prompt
                </label>
                
                <div className="flex items-center gap-4">
                  {/* Live Timer Display */}
                  <div className={`flex items-center gap-2 font-mono text-sm px-3 py-1 rounded bg-zinc-900 border border-zinc-800 transition-colors
                    ${gameState === 'ACTIVE' ? 'text-indigo-400 border-indigo-500/30' : 'text-zinc-500'}
                  `}>
                    <Timer className={`w-3.5 h-3.5 ${gameState === 'ACTIVE' ? 'animate-pulse' : ''}`} />
                    {formatTime(elapsedTimeMs)}
                  </div>
                  
                  <span className={`font-mono text-xs ${prompt.length > 200 ? 'text-amber-500' : 'text-zinc-500'}`}>
                    {prompt.length} chars
                  </span>
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={gameState !== 'ACTIVE'}
                  placeholder={gameState === 'LOCKED' ? "Unlock the mission above to start..." : "E.g., Solve this using a recursive approach one-liner..."}
                  className={`w-full h-32 bg-zinc-900/50 border border-zinc-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none font-mono text-sm transition-all shadow-inner
                    ${gameState === 'LOCKED' ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                />
                
                {/* Visual Asset Indicator in Input */}
                {problem?.imageUrl && gameState === 'ACTIVE' && (
                  <div className={`absolute bottom-3 left-3 bg-zinc-950/80 backdrop-blur-sm border rounded-lg px-2 py-1.5 flex items-center gap-2 animate-in fade-in zoom-in duration-300 ${imageError ? 'border-rose-500/30' : 'border-amber-500/30'}`}>
                    <div className="relative w-8 h-8 rounded border border-zinc-700 overflow-hidden flex items-center justify-center bg-zinc-900">
                      {imageError ? (
                        <ImageOff className="w-4 h-4 text-rose-500" />
                      ) : (
                        <img 
                          src={problem.imageUrl} 
                          className="w-full h-full object-cover opacity-80" 
                          alt="asset" 
                          onError={() => setImageError(true)}
                        />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1 ${imageError ? 'text-rose-500' : 'text-amber-500'}`}>
                        <Eye className="w-3 h-3" /> {imageError ? 'Asset Missing' : 'Visual Intel Attached'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-3 right-3 flex gap-2">
                  {gameState === 'ACTIVE' || gameState === 'COMPLETED' ? (
                    <>
                      {gameState === 'COMPLETED' && (
                        <Button onClick={handleReset} variant="secondary" className="text-xs py-1 h-8 font-mono">
                          <RotateCcw className="w-3 h-3 mr-1" /> RETRY
                        </Button>
                      )}
                      {gameState === 'ACTIVE' && (
                        <Button onClick={handleRun} disabled={!prompt.trim()} className="h-8 text-xs py-1 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] font-mono tracking-wider">
                          <Lock className="w-3 h-3 mr-1" /> LOCK & RUN
                        </Button>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
              
              {gameState === 'ACTIVE' && (
                <div className="text-[10px] text-zinc-500 flex justify-end items-center gap-1 pr-1 font-mono">
                  <Info className="w-3 h-3" />
                  <span>Tip: Specific instructions yield better code. Check the <button onClick={() => setIsGuideOpen(true)} className="text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer font-medium transition-colors">Field Manual</button>.</span>
                </div>
              )}
            </div>

            {(generatedCode || gameState === 'GENERATING_SOLUTION') && (
              <div className="rounded-xl border border-zinc-800 overflow-hidden bg-[#0d0d0d] shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-zinc-900/50 px-4 py-2 border-b border-zinc-800 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                  </div>
                  <span className="text-xs text-zinc-500 font-mono ml-2 uppercase tracking-wide">gemini-3-pro-preview // output</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  {gameState === 'GENERATING_SOLUTION' ? (
                    <div className="h-32 flex items-center justify-center text-zinc-500 animate-pulse gap-2 font-mono text-sm">
                      <Sparkles className="w-4 h-4 text-indigo-500" /> INITIALIZING GENERATION...
                    </div>
                  ) : (
                    <pre className="text-sm font-mono text-zinc-300 leading-relaxed">
                      <code>{generatedCode.replace(/```(typescript|javascript|)?/g, '')}</code>
                    </pre>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Judges & Score */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* JUDGES PANEL */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                  <h3 className="text-zinc-400 font-semibold text-sm uppercase tracking-wider font-mono">Vibe Panel Assessment</h3>
                  {gameState === 'JUDGING' && <span className="text-xs text-indigo-400 animate-pulse font-mono">ANALYZING TELEMETRY...</span>}
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {JUDGES.map(judge => (
                  <JudgeCard 
                    key={judge.id} 
                    persona={judge} 
                    result={judgeResults[judge.id]} 
                    isLoading={gameState === 'JUDGING' && !judgeResults[judge.id]}
                  />
                ))}
              </div>
            </div>

            {/* FINAL SCORE & SUBMIT */}
            {gameState === 'COMPLETED' && (
              <div className={`bg-gradient-to-br border rounded-xl p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl relative overflow-hidden
                ${isPlagiarism 
                  ? 'from-rose-950/80 to-black border-rose-500/40 shadow-rose-900/20' 
                  : 'from-indigo-950/80 to-black border-indigo-500/40 shadow-indigo-900/20'
                }
              `}>
                {/* Background shine effect */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full pointer-events-none ${isPlagiarism ? 'bg-rose-500/10' : 'bg-indigo-500/10'}`}></div>

                <div className="flex flex-col items-center justify-center relative z-10">
                  <h4 className={`text-xs font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-2 font-mono ${isPlagiarism ? 'text-rose-400' : 'text-indigo-300'}`}>
                    <Trophy className="w-4 h-4" /> Final Score
                  </h4>
                  
                  {/* BIG SCORE */}
                  <div className={`text-8xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] mb-2 tracking-tighter font-mono ${isPlagiarism ? 'text-rose-500' : ''}`}>
                    {finalScore}
                  </div>

                  {/* BREAKDOWN & PERCENTILE */}
                  {isPlagiarism ? (
                    <div className="space-y-4 mb-8 flex flex-col items-center w-full">
                       <div className="bg-rose-950/50 border border-rose-500/50 rounded p-3 px-6 animate-pulse">
                         <span className="text-rose-400 font-bold font-mono text-sm tracking-wider">SYSTEM LOCKOUT</span>
                         <div className="text-[10px] text-rose-300/80 font-mono mt-1">PLAGIARISM DETECTED</div>
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-8 flex flex-col items-center w-full">
                      <div className="text-xs text-zinc-500 font-mono flex items-center justify-center gap-2">
                        <Calculator className="w-3 h-3" />
                        {scoreEquation} = <span className="text-zinc-300 font-bold">{finalScore}</span>
                      </div>
                      
                      {/* ANIMATED PERCENTILE GAUGE */}
                      {leaderboard.length > 0 && (
                        <PercentileGauge percentile={percentile} />
                      )}
                    </div>
                  )}

                  {/* SUBMISSION FLOW */}
                  {showSubmission && !isPlagiarism ? (
                    <div className="w-full max-w-xs mx-auto animate-in fade-in delay-200">
                      {!githubUser ? (
                        <div className="space-y-3">
                          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold font-mono">Identity Protocol</p>
                          
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                              <UserCircle2 className="w-4 h-4" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Enter Codename or GitHub Handle"
                                className="w-full bg-black/60 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-zinc-600 font-mono"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmitScore()}
                              />
                          </div>

                          <div className="flex gap-2">
                              <Button 
                                onClick={handleVerifyGithub} 
                                isLoading={verifyingGithub} 
                                disabled={!userName.trim()}
                                className="flex-1 font-mono text-[10px] h-8"
                                variant="secondary"
                                title="Fetch Avatar from GitHub"
                              >
                                <Github className="w-3 h-3 mr-1" /> Verify
                              </Button>

                              <Button 
                                onClick={handleSubmitScore} 
                                disabled={!userName.trim()}
                                className="flex-1 font-mono text-[10px] h-8 bg-emerald-600 hover:bg-emerald-500 text-white"
                              >
                                Submit
                              </Button>
                          </div>
                          
                          {githubError && <p className="text-xs text-rose-500 font-mono">{githubError}</p>}
                          
                          <div className="text-[10px] text-zinc-500 pt-1 text-center font-mono">
                            GitHub verification is optional.
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 bg-zinc-900/50 p-4 rounded-xl border border-indigo-500/20">
                          <div className="flex items-center gap-3">
                              <img src={githubUser.avatar_url} className="w-10 h-10 rounded-full border border-indigo-500/50" alt="avatar" />
                              <div className="text-left">
                                <div className="text-sm font-bold text-white font-mono">{githubUser.login}</div>
                                <div className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono uppercase">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Verified
                                </div>
                              </div>
                              <button onClick={() => setGithubUser(null)} className="ml-auto text-xs text-zinc-500 hover:text-white underline font-mono">
                                Change
                              </button>
                          </div>
                          
                          {/* SHARE BUTTON IMPLEMENTATION */}
                          <div className="grid grid-cols-2 gap-2">
                             <Button onClick={handleSubmitScore} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono uppercase tracking-wide text-xs">
                               <Send className="w-3 h-3 mr-2" /> Upload
                             </Button>
                             <Share rank={calculatePercentile(finalScore) < 50 ? 99 : 1} score={finalScore} />
                          </div>
                          
                        </div>
                      )}
                    </div>
                  ) : (
                    gameState === 'COMPLETED' && !isPlagiarism && (
                        <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
                          <div className="flex justify-center items-center gap-2 text-emerald-400 font-medium bg-emerald-500/5 px-4 py-2 rounded-lg border border-emerald-500/10 font-mono uppercase tracking-wide text-xs">
                            <CheckCircle2 className="w-5 h-5" /> Data Uploaded
                          </div>
                          <div className="w-full">
                            <Share rank={calculatePercentile(finalScore) < 50 ? 99 : 1} score={finalScore} />
                          </div>
                        </div>
                    )
                  )}
                  
                  {isPlagiarism && (
                    <div className="text-xs text-rose-500 font-mono mt-4 uppercase tracking-wider">
                        Submission Rejected
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* MINI LEADERBOARD */}
            {problem && (
              <Leaderboard entries={leaderboard.filter(e => e.problemId === problem.id)} />
            )}

          </div>
        </div>
      )}
    </Layout>
  );
}
```