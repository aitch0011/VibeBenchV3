
import { supabase } from './supabaseClient';
import type { LeaderboardEntry } from '../types';

export async function initDB(): Promise<void> {
  // No initialization needed with Supabase
  console.log('Supabase client initialized');
}

export async function saveScore(entry: LeaderboardEntry): Promise<void> {
  const { error } = await supabase
    .from('leaderboard')
    .insert({
      id: entry.id,
      problem_id: entry.problemId,
      user_name: entry.userName,
      avatar_url: entry.avatarUrl || null,
      profile_url: entry.profileUrl || null,
      prompt_length: entry.promptLength,
      duration_ms: entry.durationMs,
      total_score: entry.totalScore,
      
      // New Schema Mapping
      completeness_score: entry.breakdown.completeness,
      efficiency_score: entry.breakdown.efficiency,
      precision_score: entry.breakdown.precision,
      engineering_judgment_score: entry.breakdown.engineering_judgment,
      
      timestamp: entry.timestamp,
    });

  if (error) {
    console.error('Error saving score:', error);
    throw new Error(`Failed to save score: ${error.message}`);
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('total_score', { ascending: false });

  if (error) {
    console.error('Error fetching leaderboard:', error);
    throw new Error(`Failed to fetch leaderboard: ${error.message}`);
  }

  // Transform snake_case to camelCase
  return (data || []).map((row: any) => ({
    id: row.id,
    problemId: row.problem_id,
    userName: row.user_name,
    avatarUrl: row.avatar_url,
    profileUrl: row.profile_url,
    promptLength: row.prompt_length,
    durationMs: row.duration_ms,
    totalScore: row.total_score,
    breakdown: {
      completeness: row.completeness_score || 0,
      efficiency: row.efficiency_score || 0,
      precision: row.precision_score || 0,
      engineering_judgment: row.engineering_judgment_score || 0,
    },
    timestamp: row.timestamp,
  }));
}
