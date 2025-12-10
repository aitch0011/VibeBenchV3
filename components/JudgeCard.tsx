
import React from 'react';
import { ScoreDimension, DimensionScore } from '../types';
import { CheckCircle2, Zap, Target, Brain, Loader2 } from 'lucide-react';

interface Props {
  dimension: ScoreDimension;
  result?: DimensionScore;
  isLoading: boolean;
}

const IconMap: Record<string, any> = {
  CheckCircle2,
  Zap,
  Target,
  Brain
};

export const JudgeCard: React.FC<Props> = ({ dimension, result, isLoading }) => {
  const Icon = IconMap[dimension.iconName];

  // Liquid Glass Styles
  const glassBase = "bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]";
  const activeGlow = `shadow-[0_0_30px_rgba(255,255,255,0.05)] ${dimension.border} bg-white/10`;

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-6 transition-all duration-500
      ${isLoading ? `${glassBase} ${activeGlow}` : ''}
      ${result ? glassBase : (!isLoading && 'bg-white/5 border border-white/5 opacity-50 backdrop-blur-sm')}
    `}>
      {isLoading && (
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-2xl">
          <Loader2 className={`w-8 h-8 animate-spin ${dimension.color}`} />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl border ${dimension.bg} ${dimension.border} ${dimension.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wide">{dimension.label}</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">{dimension.description}</p>
          </div>
        </div>
        {result && (
          <div className="flex flex-col items-end">
            <span className={`text-2xl font-black font-mono leading-none ${
              result.score >= 90 ? 'text-emerald-400' : 
              result.score >= 70 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {result.score}
            </span>
            <span className="text-[10px] text-white/30 font-mono tracking-widest mt-1">POINTS</span>
          </div>
        )}
      </div>

      <div className="min-h-[40px]">
        {result ? (
          <p className="text-sm leading-relaxed text-white/80 animate-in fade-in slide-in-from-bottom-2 duration-500 font-medium border-l-2 border-white/10 pl-3">
            {result.justification}
          </p>
        ) : (
          <p className="text-xs text-white/30 italic font-mono">
            {isLoading ? "Analyzing..." : "Waiting for prompt..."}
          </p>
        )}
      </div>
    </div>
  );
};
