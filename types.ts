
export type Domain = 'Frontend' | 'Backend';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Modality = 'text' | 'image' | 'voice';

export interface Problem {
  id: string;
  domain: Domain;
  title: string;
  difficulty: Difficulty;
  description: string; // Mission Directive
  tacticalConstraint: string; // Specific constraints
  exampleInput: string;
  exampleOutput: string;
  judgeContext: string; // Hidden context for the AI
  initiativeTargets?: string[]; // Optional hidden bonus targets
  imageUrl?: string; // Visual Intel
  modality: Modality;
}

export interface ScoreDimension {
  id: 'completeness' | 'efficiency' | 'precision' | 'engineering_judgment';
  label: string;
  letter: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  iconName: 'CheckCircle2' | 'Zap' | 'Target' | 'Brain';
}

export interface DimensionScore {
  score: number;
  justification: string;
}

export interface EvaluationResult {
  reasoning: string;
  completeness: DimensionScore;
  efficiency: DimensionScore;
  precision: DimensionScore;
  engineering_judgment: DimensionScore;
  traps_triggered: string[];
  bonuses_awarded: string[];
  final_score: number;
  verdict: string;
}

export interface LeaderboardEntry {
  id: string;
  problemId: string;
  userName: string;
  avatarUrl?: string; 
  profileUrl?: string; 
  promptLength: number;
  durationMs: number; 
  totalScore: number;
  breakdown: {
    completeness: number;
    efficiency: number;
    precision: number;
    engineering_judgment: number;
  };
  timestamp: number;
}

export type GameState = 'LOCKED' | 'ACTIVE' | 'GENERATING_SOLUTION' | 'JUDGING' | 'COMPLETED';
