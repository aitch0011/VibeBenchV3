import React from 'react';
import { Problem } from '../types';
import { Mic, Image, Type, ArrowRight } from 'lucide-react';

interface Props {
  challenges: Problem[];
  onSelectChallenge: (problem: Problem) => void;
}

export const ChallengeGrid: React.FC<Props> = ({ challenges, onSelectChallenge }) => {
  
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Medium': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Hard': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      default: return 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10';
    }
  };

  const getModalityIcon = (mod: string) => {
    switch (mod) {
      case 'voice': return <Mic className="w-3 h-3" />;
      case 'image': return <Image className="w-3 h-3" />;
      default: return <Type className="w-3 h-3" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      {challenges.map((challenge) => (
        <button
          key={challenge.id}
          onClick={() => onSelectChallenge(challenge)}
          className="group relative flex flex-col items-start text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-lg"
        >
          <div className="flex w-full justify-between items-start mb-4">
             <div className="p-2 rounded-lg bg-white/5 text-white/50 group-hover:text-white group-hover:bg-white/10 transition-colors">
                {getModalityIcon(challenge.modality)}
             </div>
             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getDifficultyColor(challenge.difficulty)}`}>
               {challenge.difficulty}
             </span>
          </div>
          
          <h4 className="text-white font-bold text-lg font-sans mb-1 group-hover:text-teal-300 transition-colors">
            {challenge.title}
          </h4>
          
          <p className="text-white/40 text-xs leading-relaxed mb-6 line-clamp-2">
            {challenge.description}
          </p>
          
          <div className="mt-auto flex items-center text-xs font-bold text-white/30 group-hover:text-white transition-colors font-mono uppercase tracking-widest">
            START <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      ))}
    </div>
  );
};