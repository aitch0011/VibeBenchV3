
import React from 'react';
import { X, BookOpen, Type, Image, Mic } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const FieldGuide: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a]/90 border border-white/10 w-full max-w-2xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300 backdrop-blur-xl ring-1 ring-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-teal-500/10 rounded-xl text-teal-400 border border-teal-500/10">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-sans tracking-tight">VibeBench Manual</h2>
              <p className="text-xs text-white/40 uppercase tracking-wider font-mono">Field Operations Guide</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
          
          {/* How It Works */}
          <section className="space-y-4">
             <h3 className="text-lg font-bold text-white font-sans tracking-tight border-b border-white/10 pb-2">How It Works</h3>
             <div className="space-y-4 text-sm text-white/70 leading-relaxed">
                <div className="flex gap-4">
                   <div className="font-mono font-bold text-teal-500">01</div>
                   <div><strong className="text-white">Pick a challenge.</strong> Choose a vertical (Frontend or Backend) and difficulty level.</div>
                </div>
                <div className="flex gap-4">
                   <div className="font-mono font-bold text-teal-500">02</div>
                   <div><strong className="text-white">Read the brief.</strong> Each challenge has a mission directive, tactical constraints, and a test harness showing expected behavior.</div>
                </div>
                <div className="flex gap-4">
                   <div className="font-mono font-bold text-teal-500">03</div>
                   <div><strong className="text-white">Write one prompt.</strong> You get one shot. Write the prompt you'd give an AI to solve the challenge.</div>
                </div>
                <div className="flex gap-4">
                   <div className="font-mono font-bold text-teal-500">04</div>
                   <div><strong className="text-white">Get scored.</strong> Our judge evaluates your prompt on CEPE:
                      <ul className="mt-2 space-y-1 text-white/50 list-disc pl-4">
                         <li><strong className="text-emerald-400">C</strong>ompleteness — Did you cover all requirements?</li>
                         <li><strong className="text-amber-400">E</strong>fficiency — Did you minimize token waste?</li>
                         <li><strong className="text-cyan-400">P</strong>recision — Was it unambiguous?</li>
                         <li><strong className="text-purple-400">E</strong>ngineering Judgment — Did you think like a senior?</li>
                      </ul>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="font-mono font-bold text-teal-500">05</div>
                   <div><strong className="text-white">See your rank.</strong> Compare your score against other operators.</div>
                </div>
             </div>
          </section>

          {/* Rules */}
          <section className="space-y-4">
             <h3 className="text-lg font-bold text-white font-sans tracking-tight border-b border-white/10 pb-2">Rules</h3>
             <ul className="space-y-2 text-sm text-white/70 list-disc pl-4">
                <li><strong className="text-white">One prompt per challenge.</strong> No edits after submit.</li>
                <li><strong className="text-white">No time limit.</strong> Take your time to think.</li>
                <li><strong className="text-white">Prompt only.</strong> We judge your prompt, not just the code it generates.</li>
             </ul>
          </section>

          {/* Challenge Types */}
          <section className="space-y-4">
             <h3 className="text-lg font-bold text-white font-sans tracking-tight border-b border-white/10 pb-2">Challenge Types</h3>
             <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                   <div className="text-xs font-bold text-white uppercase mb-1 flex items-center gap-2">
                     <Type className="w-3 h-3 text-white/70" /> Text
                   </div>
                   <div className="text-xs text-white/50">Type your prompt.</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                   <div className="text-xs font-bold text-white uppercase mb-1 flex items-center gap-2">
                     <Image className="w-3 h-3 text-white/70" /> Image
                   </div>
                   <div className="text-xs text-white/50">Interpret visual intel.</div>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                   <div className="text-xs font-bold text-white uppercase mb-1 flex items-center gap-2">
                     <Mic className="w-3 h-3 text-white/70" /> Voice
                   </div>
                   <div className="text-xs text-white/50">Speak your prompt.</div>
                </div>
             </div>
          </section>

          {/* Tips */}
          <section className="space-y-4">
             <h3 className="text-lg font-bold text-white font-sans tracking-tight border-b border-white/10 pb-2">Tips</h3>
             <ul className="space-y-3 text-sm text-white/70">
                <li className="flex gap-2">
                   <span className="text-teal-500">✓</span>
                   <span>Be specific. Vague prompts score low on Precision.</span>
                </li>
                <li className="flex gap-2">
                   <span className="text-teal-500">✓</span>
                   <span>Cover edge cases. Missing requirements hurt Completeness.</span>
                </li>
                <li className="flex gap-2">
                   <span className="text-teal-500">✓</span>
                   <span>Don't over-explain. Redundant instructions hurt Efficiency.</span>
                </li>
                <li className="flex gap-2">
                   <span className="text-teal-500">✓</span>
                   <span>Think ahead. Consider failure modes for Engineering Judgment.</span>
                </li>
             </ul>
          </section>

        </div>
      </div>
    </div>
  );
};
