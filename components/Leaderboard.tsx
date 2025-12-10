
import React from 'react';
import { LeaderboardEntry } from '../types';
import { Hash, ExternalLink, Activity } from 'lucide-react';
import { PROBLEMS } from '../constants';

interface Props {
  entries: LeaderboardEntry[];
  showDomain?: boolean;
  theme?: 'light' | 'dark';
}

const formatDuration = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
};

export const Leaderboard: React.FC<Props> = ({ entries, showDomain = false, theme = 'dark' }) => {
  const sorted = [...entries].sort((a, b) => b.totalScore - a.totalScore);
  const isDark = theme === 'dark';

  const rowBaseClass = isDark 
    ? "bg-white/5 border-white/5 group-hover:bg-white/10 group-hover:border-white/10 text-white" 
    : "bg-white border-zinc-100 group-hover:bg-zinc-50 group-hover:border-zinc-200 text-zinc-900 shadow-sm";
    
  const textMuted = isDark ? "text-white/30" : "text-zinc-400";

  return (
    <div className="rounded-3xl flex flex-col relative w-full">
      <div className={`overflow-y-auto max-h-[600px] p-2 ${isDark ? "custom-scrollbar" : ""}`}>
        <table className="w-full text-left text-sm border-separate border-spacing-y-2">
          <thead className={`${textMuted} font-medium hidden sm:table-header-group`}>
            <tr>
              <th className="px-6 py-2 w-16 text-center text-xs font-mono">#</th>
              <th className="px-4 py-2 text-xs font-mono uppercase tracking-wider">OPERATOR</th>
              {showDomain && <th className="px-4 py-2 text-xs font-mono uppercase tracking-wider">MISSION</th>}
              <th className="px-4 py-2 text-center text-xs font-mono uppercase tracking-wider hidden md:table-cell">C / E / P / E</th>
              <th className="px-4 py-2 text-right text-xs font-mono uppercase tracking-wider">OVERALL</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={showDomain ? 5 : 4} className={`px-6 py-12 text-center italic text-xs font-mono uppercase tracking-wide rounded-xl border ${isDark ? "bg-white/5 border-white/5 text-white/30" : "bg-zinc-50 border-zinc-200 text-zinc-400"}`}>
                  NO PILOTS LOGGED.
                </td>
              </tr>
            ) : (
              sorted.map((entry, idx) => {
                const problem = showDomain ? PROBLEMS.find(p => p.id === entry.problemId) : null;
                
                return (
                  <tr key={entry.id} className="group transition-transform duration-300 hover:scale-[1.01]">
                    {/* Rank */}
                    <td className={`px-6 py-4 text-center rounded-l-xl border-y border-l backdrop-blur-md ${rowBaseClass}`}>
                      <span className={`font-mono text-sm font-bold ${
                        idx === 0 ? (isDark ? 'text-amber-400' : 'text-amber-600') :
                        idx === 1 ? (isDark ? 'text-zinc-300' : 'text-zinc-600') :
                        idx === 2 ? (isDark ? 'text-orange-400' : 'text-orange-600') : textMuted
                      }`}>
                        {idx + 1}
                      </span>
                    </td>

                    {/* Operator */}
                    <td className={`px-4 py-4 border-y backdrop-blur-md ${rowBaseClass}`}>
                      <div className="flex items-center gap-3">
                        {entry.avatarUrl ? (
                          <img src={entry.avatarUrl} alt={entry.userName} className={`w-8 h-8 rounded-lg border object-cover ${isDark ? 'border-white/10 bg-black/40' : 'border-zinc-200 bg-zinc-100'}`} />
                        ) : (
                          <div className={`w-8 h-8 rounded-lg border flex items-center justify-center text-[10px] font-bold font-mono ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-zinc-100 border-zinc-200 text-zinc-500'}`}>
                            {entry.userName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          {entry.profileUrl ? (
                            <a 
                              href={entry.profileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={`font-bold font-mono uppercase text-xs hover:underline flex items-center gap-1 ${isDark ? 'text-white/90 hover:text-teal-400' : 'text-zinc-900 hover:text-teal-600'}`}
                            >
                              {entry.userName}
                              <ExternalLink className="w-2 h-2 opacity-50" />
                            </a>
                          ) : (
                            <div className={`font-bold font-mono uppercase text-xs ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>{entry.userName}</div>
                          )}
                          
                          <div className={`flex items-center gap-2 mt-0.5 text-[9px] font-mono ${textMuted}`}>
                             <span className="flex items-center gap-1" title="Prompt Length (characters)">
                                <Hash className="w-2.5 h-2.5" /> {entry.promptLength} chars
                             </span>
                             <span>•</span>
                             <span>{formatDuration(entry.durationMs)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Mission */}
                    {showDomain && (
                      <td className={`px-4 py-4 border-y backdrop-blur-md ${rowBaseClass}`}>
                        {problem ? (
                          <div className="flex flex-col">
                            <span className={`text-xs font-bold uppercase tracking-tight ${isDark ? 'text-white/90' : 'text-zinc-900'}`}>{problem.title}</span>
                            <div className="flex gap-2 mt-1">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-zinc-100 border-zinc-200 text-zinc-500'} font-mono uppercase`}>
                                    {problem.domain}
                                </span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                                    problem.difficulty === 'Easy' ? (isDark ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-emerald-600 border-emerald-200 bg-emerald-50') :
                                    problem.difficulty === 'Medium' ? (isDark ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' : 'text-amber-600 border-amber-200 bg-amber-50') :
                                    (isDark ? 'text-rose-400 border-rose-500/20 bg-rose-500/10' : 'text-rose-600 border-rose-200 bg-rose-50')
                                } font-mono uppercase`}>
                                    {problem.difficulty}
                                </span>
                            </div>
                          </div>
                        ) : <span className="text-xs opacity-30">UNKNOWN</span>}
                      </td>
                    )}

                    {/* CEPE Breakdown (Hidden on Mobile) */}
                    <td className={`px-4 py-4 border-y backdrop-blur-md hidden md:table-cell ${rowBaseClass}`}>
                       <div className="flex items-center justify-center gap-1.5">
                          {[
                            { val: entry.breakdown.completeness, col: 'bg-emerald-500' },
                            { val: entry.breakdown.efficiency, col: 'bg-amber-500' },
                            { val: entry.breakdown.precision, col: 'bg-cyan-500' },
                            { val: entry.breakdown.engineering_judgment, col: 'bg-purple-500' }
                          ].map((b, i) => (
                             <div key={i} className="flex flex-col items-center gap-1" title={String(b.val)}>
                                <div className={`w-1.5 h-6 rounded-full ${isDark ? 'bg-white/10' : 'bg-zinc-200'} relative overflow-hidden`}>
                                   <div className={`absolute bottom-0 w-full ${b.col}`} style={{ height: `${b.val}%` }} />
                                </div>
                             </div>
                          ))}
                       </div>
                    </td>

                    {/* Total Score */}
                    <td className={`px-4 py-4 text-right rounded-r-xl border-y border-r backdrop-blur-md ${rowBaseClass}`}>
                      <span className={`font-black text-lg font-mono tracking-tight ${
                        entry.totalScore >= 90 ? 'text-emerald-500' :
                        entry.totalScore >= 70 ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                        {entry.totalScore.toFixed(0)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
