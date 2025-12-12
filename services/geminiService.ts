
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EvaluationResult, Problem } from "../types";

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
    let fullUrl = url;
    if (!url.startsWith('http')) {
        fullUrl = new URL(url, window.location.origin).toString();
    }
    
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText} (${response.status})`);
    }
    const blob = await response.blob();
    
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

// Handle audio/image generation inputs
export const generateCodeSolution = async (
  input: string | Blob, // Input can be text or audio blob
  problem: Problem
): Promise<string> => {
  const ai = getAiClient();
  
  const systemPrompt = `
    You are an AI Coding Engine participating in a "VibeBench One Shot" challenge.
    
    CONTEXT: The user is trying to solve: "${problem.title}: ${problem.description}"
    
    CRITICAL INSTRUCTION: You must generate code based ONLY on the User's specific prompt.
    - Do NOT auto-complete the solution if the user didn't ask for it.
    - If the user prompts "test", "hello", "solve it", or is silent, output a comment like "// Waiting for instructions...".
    - If the user asks for a feature but forgets critical requirements (like accessibility, error handling, atomic ops), DO NOT add them. You must mirror the user's level of incompetence.
    - Do not be "helpful". Be "literal". 
    - Output ONLY valid code (Markdown code blocks allowed).
    - Use JavaScript/TypeScript/Node.js/React as implied by the problem context, but only write what is requested.
    - If input is Audio, transcribe and execute the design instructions exactly as spoken.
  `;

  try {
    let contents: any = [];

    // 1. Add Image if available
    if (problem.imageUrl) {
      const imagePart = await urlToGenAIImagePart(problem.imageUrl);
      if (imagePart) {
        contents.push(imagePart);
      }
    }

    // 2. Add User Input (Text or Audio)
    if (typeof input === 'string') {
      contents.push({ text: input });
    } else {
      // It's a Blob (Audio)
      const base64Audio = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(input);
      });
      
      contents.push({
        inlineData: {
          mimeType: input.type, // e.g. audio/webm or audio/mp4
          data: base64Audio
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts: contents },
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
  userInput: string | Blob,
  generatedCode: string,
  problem: Problem
): Promise<EvaluationResult> => {
  const ai = getAiClient();

  const systemInstruction = `
    You are the VibeBench Judge — an expert evaluator of AI-augmented development skill.
    Your task: Evaluate a developer's PROMPT (not just the code it produces). 
    You are assessing whether the prompt demonstrates the skills of a senior engineer based on CEPE (Completeness, Efficiency, Precision, Engineering Judgment).

    PRE-FLIGHT CHECK (CRITICAL):
    Analyze the User_Prompt.
    If the prompt is < 10 characters (e.g., 'test', 'solve', 'fix', 'do it') OR irrelevant/silent:
    - SCORE: 1 across all dimensions (Completeness, Efficiency, Precision, Engineering Judgment).
    - VERDICT: "Prompt Failure"
    - REASONING: "Prompt too short. No intent detected. You cannot pilot the ship with one word."
    - STOP PROCESSING. Do not evaluate the code.

    CRITICAL FAILURE CONDITIONS:
    1. **Context Leak:** The GENERATED CODE might be correct because the AI is "helpful". DO NOT judge the code if the prompt did not ask for those specific features. A perfect solution with a lazy prompt gets a low score.
    2. **Empty/Silent Audio:** If audio input is noise/silence, Score = 1.
    
    ## Scoring Framework: CEPE (0-100 each)
    - C: Completeness (Requirements covered?)
    - E: Efficiency (Minimal tokens/waste?)
    - P: Precision (Unambiguous?)
    - E: Engineering Judgment (Senior thinking, trade-offs?)

    ## Process
    1. Read challenge context & traps.
    2. Analyze user's prompt (Text or Audio).
    3. Reason through CEPE.
    4. Check for traps/bonuses.
    5. Output JSON.
    
    ## Challenge Context (CRITICAL)
    ${problem.judgeContext}
    
    ## Output Rules
    - Return valid JSON matching the schema.
    - 'reasoning' should be a step-by-step analysis.
    - 'verdict' is a one-line summary.
  `;

  // Output Schema
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      reasoning: { type: Type.STRING },
      completeness: { 
        type: Type.OBJECT,
        properties: { score: { type: Type.NUMBER }, justification: { type: Type.STRING } }
      },
      efficiency: { 
        type: Type.OBJECT,
        properties: { score: { type: Type.NUMBER }, justification: { type: Type.STRING } }
      },
      precision: { 
        type: Type.OBJECT,
        properties: { score: { type: Type.NUMBER }, justification: { type: Type.STRING } }
      },
      engineering_judgment: { 
        type: Type.OBJECT,
        properties: { score: { type: Type.NUMBER }, justification: { type: Type.STRING } }
      },
      traps_triggered: { type: Type.ARRAY, items: { type: Type.STRING } },
      bonuses_awarded: { type: Type.ARRAY, items: { type: Type.STRING } },
      final_score: { type: Type.NUMBER },
      verdict: { type: Type.STRING }
    },
    required: ["reasoning", "completeness", "efficiency", "precision", "engineering_judgment", "final_score", "verdict"]
  };

  try {
    let contents: any[] = [];
    
    // 1. Add User Input (Text or Audio)
    if (typeof userInput === 'string') {
       contents.push({ text: `USER PROMPT:\n"${userInput}"` });
    } else {
       // Audio Blob
       const base64Audio = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(userInput);
      });
      contents.push({
        inlineData: {
          mimeType: userInput.type,
          data: base64Audio
        }
      });
      contents.push({ text: `[USER PROVIDED AUDIO PROMPT]` });
    }
    
    // 2. Add Generated Code Context
    contents.push({ text: `\n\nGENERATED CODE:\n${generatedCode}` });

    // --- JUDGE PAYLOAD DEBUG (INSTRUMENTATION) ---
    console.log("--- JUDGE PAYLOAD DEBUG ---");
    console.log("SYSTEM PROMPT PREVIEW:", systemInstruction.substring(0, 500) + "...");
    console.log("USER INPUT TYPE:", typeof userInput === 'string' ? 'String' : 'Blob');
    if (typeof userInput === 'string') {
        console.log("USER INPUT TEXT:", userInput);
    } else {
        console.log("USER INPUT BLOB SIZE:", userInput.size);
        console.log("USER INPUT BLOB TYPE:", userInput.type);
    }
    console.log("GENERATED CODE PREVIEW:", generatedCode.substring(0, 100) + "...");
    console.log("---------------------------");
    // ---------------------------------------------

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: contents },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from judge");

    return JSON.parse(text) as EvaluationResult;

  } catch (error) {
    console.error("Judge Error:", error);
    // Fallback Result
    return {
      reasoning: "Judgement failed due to system error.",
      completeness: { score: 0, justification: "Error" },
      efficiency: { score: 0, justification: "Error" },
      precision: { score: 0, justification: "Error" },
      engineering_judgment: { score: 0, justification: "Error" },
      traps_triggered: [],
      bonuses_awarded: [],
      final_score: 0,
      verdict: "System Failure"
    };
  }
};
