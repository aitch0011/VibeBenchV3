
# VibeBench One Shot

**AI writes the code. But who writes the prompt?**

VibeBench One Shot is a competitive "prompt golf" arena where developers compete not on their ability to write syntax, but on their ability to direct AI. In the Gemini era, syntax is free. **Intent is everything.**

Traditional coding interviews test if you can reverse a linked list. VibeBench tests if you can articulate a production-ready system design in a single, precise instruction.

## The Challenge

1. **Select a Mission**: Choose from Frontend or Backend challenges ranging from "Accessible Button" to "Thundering Herd" concurrency problems.
2. **One Shot**: You get **one** attempt.
   - **Text Mode**: Write the perfect prompt.
   - **Voice Mode**: Speak your architectural intent directly to the model.
3. **AI Execution**: Google's `gemini-3-pro-preview` generates the code based *strictly* on your prompt. It is instructed to be literal—if you forget error handling, the code will crash.
4. **CEPE Scoring**: An AI Judge (`gemini-2.5-flash`) evaluates your **prompt** against the CEPE framework.

## The CEPE Framework

We don't just check if the code passes tests. We judge the prompt that created it.

- **Completeness**: Did you cover requirements, edge cases, accessibility, and error states?
- **Efficiency**: Did you minimize token waste? No filler, just signal.
- **Precision**: Was your prompt unambiguous? Could a junior dev misinterpret it?
- **Engineering Judgment**: Did you anticipate trade-offs, security risks (e.g., SQL injection, XSS), and scalability issues?

## Tech Stack

- **Frontend**: React 19, Tailwind CSS
- **AI Integration**: Google GenAI SDK (`@google/genai`)
  - Generator: `gemini-3-pro-preview`
  - Judge: `gemini-2.5-flash`
- **Database**: Supabase (Leaderboard & Storage)
- **Icons**: Lucide React

## Setup

1. **Environment Variables**:
   You need a Google AI Studio API key to power the Gemini models.

   ```env
   API_KEY=your_google_ai_studio_key
   ```

2. **Supabase**:
   The project includes fallback credentials for the demo leaderboard. For a private instance, update `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

3. **Install & Run**:
   ```bash
   npm install
   npm run dev
   ```

## License

MIT
