import React from 'react';
import { Problem } from '../types';
import { FileCode2, Terminal, Target, Play, AlertCircle, Eye } from 'lucide-react';
import { Button } from './Button';
import { TimebombToast } from './TimebombToast';

interface Props {
  problem: Problem;
  isRevealed: boolean;
  onStart: () => void;
}

export const ProblemCard: React.FC<Props> = ({ problem, isRevealed, onStart }) => {
  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative group transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07]">
      {/* Header */}
      <div className="bg-white/5 p-6 border-b border-white/5 flex items-center justify-between backdrop-blur-sm relative z-20">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-teal-500/20 rounded-xl border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
            <FileCode2 className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight font-sans">
              {isRevealed ? problem.title : 'Mission Brief'}
            </h2>
            <div className="text-[10px] text-white/40 font-mono uppercase tracking-wider flex items-center gap-2 mt-0.5">
              <span>ID: {problem.id}</span>
              <span className="text-white/20">|</span>
              <span>Domain: {problem.domain}</span>
            </div>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border tracking-wider uppercase font-mono backdrop-blur-md
          ${!isRevealed ? 'bg-white/5 text-white/30 border-white/5' : 
            problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 
            problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 
            'bg-rose-500/10 text-rose-300 border-rose-500/20'}
        `}>
          {isRevealed ? problem.difficulty : 'READY'}
        </span>
      </div>
      
      <div className="relative">
        {/* Content - Blurred when not started */}
        <div className={`p-8 space-y-8 transition-all duration-500 ${!isRevealed ? 'blur-md opacity-40 select-none grayscale' : ''}`}>
          
          {/* Mission Directive */}
          <div className="space-y-3">
             <h3 className="text-xs font-bold text-teal-300 uppercase tracking-widest flex items-center gap-2 font-mono">
              <Target className="w-3 h-3" />
              Mission Directive
            </h3>
            <p className="text-white/90 leading-relaxed text-lg font-medium whitespace-pre-wrap font-sans">
              {problem.description}
            </p>
          </div>

          {/* Visual Intel (Image or Component) */}
          {(problem.imageUrl || problem.id === 'frontend-01') && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-2 font-mono">
                <Eye className="w-3 h-3" />
                Visual Intel
              </h3>
              
              {problem.id === 'frontend-01' ? (
                <TimebombToast />
              ) : (
                <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl group-hover:shadow-amber-500/10 transition-shadow">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-10"></div>
                  <img 
                    src={problem.imageUrl} 
                    alt="Mission Reference" 
                    className="w-full h-auto object-cover max-h-[300px] hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-3 left-3 z-20">
                    <span className="px-2 py-1 bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-300 text-[10px] font-mono uppercase tracking-widest rounded">
                      Reference Asset
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tactical Constraint */}
          <div className="space-y-3">
             <h3 className="text-xs font-bold text-rose-300 uppercase tracking-widest flex items-center gap-2 font-mono">
              <AlertCircle className="w-3 h-3" />
              Tactical Constraint
            </h3>
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
              <p className="text-rose-200/80 leading-relaxed text-sm font-medium">
                {problem.tacticalConstraint}
              </p>
            </div>
          </div>

          {/* Examples Section */}
          <div className="bg-black/20 rounded-xl border border-white/5 p-6 backdrop-blur-sm">
            <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-4 flex items-center gap-2 font-mono">
              <Terminal className="w-3 h-3" />
              Test Harness Spec
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/5">
              {/* Input */}
              <div className="pb-4 md:pb-0 md:pr-4">
                <span className="text-xs text-white/40 block mb-2 font-mono">Input</span>
                <code className="text-sm font-mono text-emerald-300 bg-emerald-950/20 border border-emerald-500/10 px-3 py-2 rounded-lg block w-full overflow-x-auto shadow-inner">
                  {problem.exampleInput}
                </code>
              </div>
              
              {/* Output */}
              <div className="pt-4 md:pt-0 md:pl-4">
                 <span className="text-xs text-white/40 block mb-2 font-mono">Expected Behavior</span>
                 <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-teal-300 bg-teal-950/20 border border-teal-500/10 px-3 py-2 rounded-lg block w-full overflow-x-auto shadow-inner">
                      {problem.exampleOutput}
                    </code>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for Start Button */}
        {!isRevealed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/40 backdrop-blur-md">
              <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(20,184,166,0.2)] mb-6 backdrop-blur-xl">
                <Play className="w-8 h-8 text-teal-300 ml-1" />
              </div>
              <h3 className="text-2xl font-bold text-white font-sans tracking-tight mb-2">Initialize Protocol</h3>
              <p className="text-white/50 text-sm max-w-xs text-center mb-8 font-medium">
                Review the brief. Prepare your prompt.
              </p>
              <Button onClick={onStart} className="px-10 py-4 text-base bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-500/25 font-mono tracking-wide rounded-xl">
                START MISSION
              </Button>
          </div>
        )}
      </div>
    </div>
  );
};