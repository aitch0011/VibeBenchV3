
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Zap, Brain, Target, Shield, Info } from 'lucide-react';

export const ArenaHeader: React.FC = () => {
  const [showRules, setShowRules] = useState(true);

  return (
    <div className="w-full mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter font-sans mb-1">
            SEASON 1 ARENA
          </h1>
          <p className="text-white/50 font-mono text-sm max-w-xl">
            6 challenges. One prompt each. No second chances.
          </p>
        </div>
        <button 
          onClick={() => setShowRules(!showRules)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-400 hover:text-teal-300 transition-colors bg-teal-500/10 px-4 py-2 rounded-lg border border-teal-500/20"
        >
          {showRules ? 'Hide Protocol' : 'View Protocol'}
          {showRules ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {showRules && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-300">
           {/* Rule 1 */}
           <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/80 font-bold text-sm font-mono uppercase tracking-wide">
                 <Target className="w-4 h-4 text-teal-400" />
                 One Shot
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                 You get exactly one prompt per challenge. The AI generates code once. No edits. No retries.
              </p>
           </div>
           
           {/* Rule 2 */}
           <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/80 font-bold text-sm font-mono uppercase tracking-wide">
                 <Shield className="w-4 h-4 text-rose-400" />
                 CEPE Scoring
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                 Judged on Completeness, Efficiency, Precision, and Engineering Judgment.
              </p>
           </div>

           {/* Rule 3 */}
           <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/80 font-bold text-sm font-mono uppercase tracking-wide">
                 <Zap className="w-4 h-4 text-amber-400" />
                 Execution
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                 We judge the Prompt, not just the Output. Boilerplate is penalized. Intent is rewarded.
              </p>
           </div>
           
           {/* Rule 4 */}
           <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/80 font-bold text-sm font-mono uppercase tracking-wide">
                 <Brain className="w-4 h-4 text-purple-400" />
                 Leaderboard
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                 Ranked by Total Score. 100 points per challenge. Global/Vertical rankings available.
              </p>
           </div>
        </div>
      )}
    </div>
  );
};
