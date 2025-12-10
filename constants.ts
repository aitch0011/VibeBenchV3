
import { Problem, ScoreDimension } from './types';

export const PROBLEMS: Problem[] = [
  // --- FRONTEND VERTICAL ---
  {
    id: 'frontend-easy',
    domain: 'Frontend',
    title: 'Accessible Button',
    difficulty: 'Easy',
    description: 'Build a reusable Button component that meets WCAG 2.1 AA accessibility standards.',
    tacticalConstraint: 'The component must be usable by keyboard-only users and screen reader users. No accessibility shortcuts.',
    exampleInput: '<Button variant="primary" onClick={handleSubmit}>Submit Form</Button>',
    exampleOutput: '// Renders accessible button with proper focus states, ARIA attributes, and keyboard handling',
    judgeContext: `CHALLENGE: Accessible Button (Frontend Easy)
EVALUATION CONTEXT:
This is an "easy" challenge testing fundamental accessibility knowledge. The trap is that most developers think "accessible" means adding aria-label — it's much more than that.
COMPLETENESS CHECKLIST:
- [ ] Focus states (focus-visible specifically, not just focus)
- [ ] Disabled state (both visual and functional)
- [ ] Keyboard handling (Enter and Space should trigger onClick)
- [ ] Loading state with aria-busy
- [ ] Variant/style props
- [ ] Type attribute (button vs submit)
TRAPS:
1. FOCUS TRAP: If they just say "add focus styles" without specifying focus-visible, they'll get the ugly focus ring on click. Deduct 10 from Engineering Judgment.
2. DISABLED TRAP: If they use disabled attribute alone without considering aria-disabled for focusability, deduct 10 from Engineering Judgment.
3. KEYBOARD TRAP: If they don't mention keyboard handling at all, Completeness caps at 60.
BONUSES:
- Mentions 44px minimum touch target: +5 Engineering Judgment
- Specifies color contrast requirements: +5 Completeness
- Mentions reduced-motion for any animations: +5 Engineering Judgment`,
    modality: 'text'
  },
  {
    id: 'frontend-medium',
    domain: 'Frontend',
    title: 'State Management',
    difficulty: 'Medium',
    description: 'Implement a data table component with optimistic UI updates. Users can edit cell values inline.',
    tacticalConstraint: 'Edits must appear instantly (optimistic update), sync to server in background, and rollback gracefully on failure. User trust is paramount.',
    exampleInput: 'User edits cell from "Draft" to "Published", server returns 500 error',
    exampleOutput: 'Cell reverts to "Draft", toast shows "Update failed", no data corruption',
    judgeContext: `CHALLENGE: State Management (Frontend Medium)
EVALUATION CONTEXT:
Medium difficulty. Tests understanding of optimistic UI patterns — a common real-world requirement that many developers get subtly wrong.
COMPLETENESS CHECKLIST:
- [ ] Optimistic state update (immediate UI change)
- [ ] Background server sync
- [ ] Error detection
- [ ] Rollback to previous state on failure
- [ ] User feedback (toast, inline error, etc.)
- [ ] Loading/pending indicator
TRAPS:
1. RACE CONDITION TRAP: If user edits A->B->C rapidly, and B fails, what happens? If the prompt doesn't consider this, deduct 15 from Engineering Judgment.
2. ROLLBACK STATE TRAP: If they say "rollback on error" but don't specify WHICH state to rollback to (previous value, not original), deduct 10 from Precision.
3. NO FEEDBACK TRAP: If optimistic update happens but user gets no indication of sync status, Completeness caps at 70.
BONUSES:
- Mentions debouncing rapid edits: +10 Engineering Judgment
- Specifies retry logic before showing error: +5 Engineering Judgment
- Mentions offline/network detection: +5 Completeness`,
    modality: 'text'
  },
  {
    id: 'frontend-hard',
    domain: 'Frontend',
    title: 'Timebomb Protocol',
    difficulty: 'Hard',
    description: "Replicate the 'System Alert' component shown in the visual intel. Design fidelity is critical.",
    tacticalConstraint: 'The component must match the reference exactly — including any implied behaviors derived from the visual state.',
    exampleInput: '<SystemAlert message="Breach Imminent" level="critical" />',
    exampleOutput: '// Renders glassmorphic alert with animated countdown bar (100% -> 0%)',
    imageUrl: 'https://vgpumykbihcvuvzxwcue.supabase.co/storage/v1/object/public/Vibebench/VibeBench%20-%20Timebomb.png',
    judgeContext: `CHALLENGE: Timebomb Protocol (Frontend Hard)
EVALUATION CONTEXT:
Hard multimodal challenge. User sees a STATIC image showing a progress bar at 50%. The core test: do they infer that this is an ANIMATED countdown, or do they just describe the static state?
THE MULTIMODAL TRAP:
The image shows 50% progress. A lazy prompter will describe what they see: "progress bar at 50%". An S-rank prompter will infer: "this is a countdown timer, animate from 100% to 0%".
COMPLETENESS CHECKLIST:
- [ ] Glassmorphism effect (backdrop-blur, transparency)
- [ ] Animation EXISTS (not static)
- [ ] Animation DIRECTION (100% -> 0%, countdown)
- [ ] Animation timing/duration specified
- [ ] Message prop handling
- [ ] Alert level variants
- [ ] Close button functionality
- [ ] Accessibility (role="alert" or aria-live)
CRITICAL TRAPS:
1. THE STATIC TRAP (FATAL):
   If prompt produces hardcoded "width: 50%" — this is catastrophic failure.
   Completeness: cap at 30
   Engineering Judgment: cap at 20
2. THE PERFORMANCE TRAP:
   If prompt results in animating CSS "width" property:
   - Causes layout thrashing (reflow every frame)
   - Correct: transform: scaleX() or clip-path for GPU acceleration
   Engineering Judgment: deduct 20
3. THE ACCESSIBILITY TRAP:
   Alert/toast MUST have role="alert" or aria-live.
   If missing: Completeness deduct 15
4. THE SECURITY TRAP:
   If code uses dangerouslySetInnerHTML without sanitization:
   Engineering Judgment: 0
   Final verdict: "XSS vulnerability. Prompt failed security review."
BONUSES:
- Specifies transform: scaleX for animation: +10 Engineering Judgment
- Mentions prefers-reduced-motion: +10 Engineering Judgment
- Specifies exact timing function (ease-out, linear): +5 Precision
- Mentions aria-live="polite" vs "assertive": +5 Completeness`,
    modality: 'image'
  },

  // --- BACKEND VERTICAL ---
  {
    id: 'backend-easy',
    domain: 'Backend',
    title: 'SQL Minefield',
    difficulty: 'Easy',
    description: 'Create a secure Node.js Express route /search that queries a users table based on a query parameter.',
    tacticalConstraint: 'The database contains VIP client data. Strict adherence to OWASP guidelines. Zero tolerance for injection vulnerabilities.',
    exampleInput: 'GET /search?q=alice',
    exampleOutput: 'Returns users matching "alice" using parameterized query',
    judgeContext: `CHALLENGE: SQL Minefield (Backend Easy)
EVALUATION CONTEXT:
Easy backend challenge testing fundamental security knowledge. SQL injection is well-known, but many developers still get it wrong in subtle ways.
COMPLETENESS CHECKLIST:
- [ ] Parameterized query (not string concatenation)
- [ ] Input validation (length, characters)
- [ ] Empty query handling
- [ ] Error handling (don't leak DB errors)
- [ ] Response format specified
CRITICAL TRAPS:
1. THE INJECTION TRAP (FATAL):
   If prompt results in string concatenation:
   "SELECT * FROM users WHERE name = '" + query + "'"
   All CEPE scores: cap at 10
   Final verdict: "SQL injection vulnerable. System compromised."
2. THE SELECT * TRAP:
   If they don't specify columns, SELECT * returns everything.
   Engineering Judgment: deduct 15
   Comment: "Data leakage. You just exposed password hashes."
3. THE EMPTY QUERY TRAP:
   If empty q parameter dumps entire table:
   Completeness: deduct 20
   Comment: "Empty query returned all VIP data."
4. THE ERROR LEAK TRAP:
   If DB errors are returned raw to client:
   Engineering Judgment: deduct 10
   Comment: "Error messages reveal table structure."
BONUSES:
- Mentions rate limiting: +10 Engineering Judgment
- Specifies audit logging: +5 Engineering Judgment
- Mentions LIKE with proper escaping for partial match: +5 Precision
- Specifies HTTP status codes for errors: +5 Completeness`,
    modality: 'text'
  },
  {
    id: 'backend-medium',
    domain: 'Backend',
    title: 'Rate Limiter',
    difficulty: 'Medium',
    description: 'Design an API rate limiter that restricts users to 100 requests per minute. Explain your approach out loud.',
    tacticalConstraint: 'The system serves a global user base. Your solution must be clear, complete, and articulated verbally. No written prompts — speak your design.',
    exampleInput: 'User makes 101st request within 60 seconds',
    exampleOutput: 'Returns 429 Too Many Requests with Retry-After header',
    judgeContext: `CHALLENGE: Rate Limiter (Backend Medium) — VOICE MODALITY
EVALUATION CONTEXT:
Medium difficulty, VOICE input. User must verbally articulate their rate limiter design. Tests both technical knowledge AND ability to communicate clearly under pressure.
VOICE-SPECIFIC EVALUATION:
- Verbal filler ("um", "uh", "like") is expected but excessive filler impacts Efficiency
- Clarity of explanation matters — could a junior dev implement from this description?
- Organization: did they structure their explanation logically?
COMPLETENESS CHECKLIST:
- [ ] Algorithm choice explained (sliding window, fixed window, token bucket, leaky bucket)
- [ ] Storage mechanism (Redis, in-memory, database)
- [ ] Key design (how to identify users — IP, API key, user ID)
- [ ] Limit configuration (100 req/min as specified)
- [ ] Response format (429 status code)
- [ ] Headers (Retry-After, X-RateLimit-*)
- [ ] Time window handling (how 60s is tracked)
TRAPS:
1. THE FIXED WINDOW TRAP:
   Fixed window has a burst problem (200 requests possible at window boundary).
   If they choose fixed window without acknowledging this: Engineering Judgment deduct 10
   If they choose sliding window or token bucket and explain why: Engineering Judgment +10
2. THE SINGLE SERVER TRAP:
   In-memory rate limiting fails with multiple servers.
   If they don't mention distributed storage (Redis): Engineering Judgment deduct 15
   Comment: "Your rate limiter resets when I hit a different server."
3. THE RACE CONDITION TRAP:
   Check-then-increment is not atomic.
   If they don't mention atomic operations (INCR) or Lua scripts: Engineering Judgment deduct 10
4. THE NO HEADERS TRAP:
   Rate limit responses MUST include Retry-After.
   If missing: Completeness deduct 10
   Comment: "Client has no idea when to retry."
BONUSES:
- Explains algorithm tradeoffs (why sliding window over fixed): +10 Engineering Judgment
- Mentions Lua script for atomic operations: +5 Engineering Judgment
- Mentions different limits for different endpoints: +5 Completeness
- Clear, well-organized verbal delivery: +5 Efficiency`,
    modality: 'voice'
  },
  {
    id: 'backend-hard',
    domain: 'Backend',
    title: 'Thundering Herd',
    difficulty: 'Hard',
    description: 'Implement a Node.js function incrementViewCount(postId) using Redis. It must maintain 100% accuracy under high concurrency.',
    tacticalConstraint: 'The system handles 10,000 requests per second. Zero tolerance for race conditions. Every view must be counted exactly once.',
    exampleInput: '10,000 concurrent calls to incrementViewCount("post_123")',
    exampleOutput: 'Redis key "views:post_123" equals exactly 10000',
    judgeContext: `CHALLENGE: Thundering Herd (Backend Hard)
EVALUATION CONTEXT:
Hard backend challenge. Tests understanding of atomic operations under high concurrency. The name "Thundering Herd" is a hint — this is about handling massive concurrent load correctly.
THE CORE TEST:
Do they understand that read-modify-write is NOT safe under concurrency?
COMPLETENESS CHECKLIST:
- [ ] Atomic increment (Redis INCR, not GET then SET)
- [ ] Connection handling (pooling, reuse)
- [ ] Error handling (Redis down, network timeout)
- [ ] Return value (new count or acknowledgment)
- [ ] Key naming convention
- [ ] Input validation (postId)
CRITICAL TRAPS:
1. THE RACE CONDITION TRAP (FATAL):
   If prompt results in:
   const count = await redis.get(key); await redis.set(key, count + 1)
   This is a catastrophic race condition.
   All CEPE scores: cap at 15
   Final verdict: "Race condition detected. At 10k req/s, you're losing thousands of views."
2. THE CONNECTION TRAP:
   If they create a new Redis connection per request:
   Engineering Judgment: deduct 20
   Comment: "Connection overhead will kill your throughput."
3. THE NO ERROR HANDLING TRAP:
   If Redis failure isn't handled:
   Completeness: deduct 15
   Engineering Judgment: deduct 10
   Comment: "Redis blip = lost views + crashed service."
4. THE FLOATING POINT TRAP:
   If they use anything other than integer increment:
   Precision: deduct 10
   Comment: "Floating point arithmetic in counters. Brave."
BONUSES:
- Mentions pipelining for batch increments: +10 Engineering Judgment
- Mentions Lua script for complex atomic operations: +5 Engineering Judgment
- Specifies circuit breaker pattern for Redis failures: +10 Engineering Judgment
- Mentions monitoring/metrics (count of failed increments): +5 Completeness`,
    modality: 'text'
  },
];

export const SCORING_DIMENSIONS: ScoreDimension[] = [
  { 
    id: 'completeness', 
    label: 'Completeness', 
    letter: 'C',
    description: 'Did you cover all requirements?',
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/20',
    iconName: 'CheckCircle2'
  },
  { 
    id: 'efficiency', 
    label: 'Efficiency', 
    letter: 'E',
    description: 'Did you minimize token waste?',
    color: 'text-amber-400', 
    bg: 'bg-amber-500/10', 
    border: 'border-amber-500/20',
    iconName: 'Zap'
  },
  { 
    id: 'precision', 
    label: 'Precision', 
    letter: 'P',
    description: 'Was your prompt unambiguous?',
    color: 'text-cyan-400', 
    bg: 'bg-cyan-500/10', 
    border: 'border-cyan-500/20',
    iconName: 'Target'
  },
  { 
    id: 'engineering_judgment', 
    label: 'Engineering', 
    letter: 'E',
    description: 'Did you think like a senior?',
    color: 'text-purple-400', 
    bg: 'bg-purple-500/10', 
    border: 'border-purple-500/20',
    iconName: 'Brain'
  }
];
