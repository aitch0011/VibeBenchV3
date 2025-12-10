
import React from 'react';
import { Layout, Server, ArrowRight, Zap, Target, Brain, CheckCircle2, Code2, Mic, MousePointer2, Activity, Lock, Image, Type, BookOpen, Terminal, Users, TrendingUp, Github } from 'lucide-react';
import { LeaderboardEntry, Problem } from '../types';
import { Leaderboard } from './Leaderboard';
import { PROBLEMS } from '../constants';

interface Props {
  onEnterArena: () => void;
  onSelectChallenge: (problemId: string) => void;
  leaderboard: LeaderboardEntry[];
  userRank?: number;
  userPercentile?: number;
}

export const DomainSelector: React.FC<Props> = ({ onEnterArena, onSelectChallenge, leaderboard, userRank }) => {
  
  const frontendChallenges = PROBLEMS.filter(p => p.domain === 'Frontend');
  const backendChallenges = PROBLEMS.filter(p => p.domain === 'Backend');

  const getChallengeIcon = (title: string) => {
    if (title.includes('Button')) return MousePointer2;
    if (title.includes('State')) return Activity;
    if (title.includes('Timebomb')) return Layout;
    if (title.includes('SQL')) return Lock;
    if (title.includes('Rate')) return Mic;
    if (title.includes('Thundering')) return Server;
    return Code2;
  };

  const getModalityIcon = (mod: string) => {
      switch (mod) {
        case 'voice': return Mic;
        case 'image': return Image;
        default: return Type;
      }
  };

  const CEPE = [
    { 
      letter: 'C', 
      title: 'Completeness', 
      question: 'Did you cover all requirements?', 
      explanation: 'A complete prompt specifies acceptance criteria, edge cases, error handling, and non-functional requirements. If you didn\'t mention it, you didn\'t ask for it.',
      icon: CheckCircle2, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      letter: 'E', 
      title: 'Efficiency', 
      question: 'Did you minimize token waste?', 
      explanation: 'An efficient prompt achieves completeness without redundancy. No filler, no repetition. Every token earns its place.',
      icon: Zap, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
    { 
      letter: 'P', 
      title: 'Precision', 
      question: 'Was your prompt unambiguous?', 
      explanation: 'A precise prompt uses specific terminology and exact constraints. If two models could interpret it differently, it wasn\'t precise enough.',
      icon: Target, 
      color: 'text-cyan-600', 
      bg: 'bg-cyan-50' 
    },
    { 
      letter: 'E', 
      title: 'Engineering Judgment', 
      question: 'Did you think like a senior?', 
      explanation: 'Engineering judgment means anticipating trade-offs, failure modes, and downstream effects. Seniors think about what could go wrong.',
      icon: Brain, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50' 
    },
  ];

  const renderChallengeCard = (problem: Problem) => {
    const Icon = getChallengeIcon(problem.title);
    const ModalityIcon = getModalityIcon(problem.modality);
    
    return (
      <button 
        key={problem.id} 
        onClick={() => onSelectChallenge(problem.id)}
        className="bg-white border border-zinc-200 p-8 rounded-2xl hover:border-teal-500/50 hover:shadow-lg transition-all duration-300 group text-left flex flex-col h-full hover:-translate-y-1"
      >
        <div className="flex justify-between items-start mb-6 w-full">
          <div className={`p-3 rounded-xl bg-zinc-50 text-zinc-500 group-hover:text-teal-600 group-hover:bg-teal-50 transition-colors`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex gap-2">
             <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono border flex items-center gap-1 bg-zinc-50 border-zinc-200 text-zinc-500`}>
                <ModalityIcon className="w-3 h-3" /> {problem.modality}
             </span>
             <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-mono border ${
                problem.difficulty === 'Hard' ? 'border-rose-200 text-rose-600 bg-rose-50' :
                problem.difficulty === 'Medium' ? 'border-amber-200 text-amber-600 bg-amber-50' :
                'border-emerald-200 text-emerald-600 bg-emerald-50'
              }`}>
                {problem.difficulty}
              </span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 mb-2 font-sans">{problem.title}</h3>
        <p className="text-sm text-zinc-500 mb-8 font-medium leading-relaxed flex-grow">
          {problem.description}
        </p>
        <div className="mt-auto flex items-center text-xs font-bold text-zinc-400 group-hover:text-teal-600 transition-colors font-mono uppercase tracking-widest">
          View Protocol <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    );
  };

  return (
    <div className="w-full">
      
      {/* 1. HERO SECTION */}
      <div id="hero" className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
         <div className="relative z-10 max-w-5xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
               <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
               Season 1 Live
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-zinc-900 tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 font-sans">
               AI WRITES THE CODE.
               <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">BUT WHO WRITES THE PROMPT?</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-500 font-medium max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
               In the Gemini era, syntax is free. Intent is everything.
               <br className="hidden md:block" />
               One prompt. One challenge. Prove you're not just getting lucky.
            </p>
            <div className="pt-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
               <button 
                  onClick={onEnterArena}
                  className="group relative px-10 py-4 bg-zinc-900 text-white rounded-full font-bold text-lg tracking-tight hover:scale-105 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 flex items-center gap-3 overflow-hidden"
               >
                  <span className="relative z-10">Enter Arena</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
               </button>
               <p className="mt-4 text-xs font-mono text-zinc-400">
                  NO SIGN-UP REQUIRED • FREE TO PLAY
               </p>
            </div>
         </div>
      </div>

      {/* 2. THE PROBLEM (IMPACT SECTION) */}
      <div id="problem" className="bg-zinc-900 text-white py-24 md:py-32 relative overflow-hidden">
         {/* Decoration */}
         <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent"></div>
         <div className="absolute -left-20 -top-20 w-96 h-96 bg-teal-500/10 blur-[100px] rounded-full"></div>

         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
               <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 text-rose-400 font-bold font-mono text-xs uppercase tracking-widest">
                     <Terminal className="w-4 h-4" /> The Shift
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter font-sans leading-tight">
                     LEETCODE IS DEAD.
                     <br />
                     <span className="text-zinc-500">SYNTAX IS OBSOLETE.</span>
                  </h2>
                  <p className="text-zinc-400 text-lg leading-relaxed">
                     Traditional assessments test if you can reverse a linked list. But Gemini can reverse a linked list in milliseconds. 
                     The old benchmarks measure a skill that AI has already commoditized.
                  </p>
               </div>
               
               <div className="space-y-6 md:pl-8 md:border-l border-zinc-800">
                  <div className="inline-flex items-center gap-2 text-teal-400 font-bold font-mono text-xs uppercase tracking-widest">
                     <Brain className="w-4 h-4" /> The Solution
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter font-sans leading-tight text-white">
                     ENTER AGENTIC LITERACY.
                  </h2>
                  <p className="text-zinc-400 text-lg leading-relaxed">
                     The new skill isn't writing code — it's <span className="text-white font-bold">directing AI</span> to write the right code. 
                     We call it Agentic Literacy: the ability to articulate intent with precision, anticipate edge cases, and think like a senior engineer.
                  </p>
                  <p className="text-teal-400 font-bold font-mono text-sm uppercase tracking-wide pt-4">
                     VibeBench is the measure.
                  </p>
               </div>
            </div>
         </div>
      </div>

      {/* 3. CHALLENGES GRID */}
      <div id="challenges" className="bg-white max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
           <div className="space-y-4">
              <h2 className="text-4xl font-black text-zinc-900 tracking-tighter font-sans">SEASON 1 CHALLENGES</h2>
              <p className="text-zinc-500 font-mono text-sm uppercase tracking-wide">6 CHALLENGES. ONE PROMPT EACH. NO SECOND CHANCES.</p>
           </div>
        </div>
        
        <div className="space-y-16">
          {/* Frontend Section */}
          <div>
            <div className="flex items-center gap-3 mb-8">
               <div className="h-px bg-zinc-200 flex-1"></div>
               <span className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest">Frontend Systems</span>
               <div className="h-px bg-zinc-200 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {frontendChallenges.map(renderChallengeCard)}
            </div>
          </div>

          {/* Backend Section */}
          <div>
            <div className="flex items-center gap-3 mb-8">
               <div className="h-px bg-zinc-200 flex-1"></div>
               <span className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest">Backend Ops</span>
               <div className="h-px bg-zinc-200 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {backendChallenges.map(renderChallengeCard)}
            </div>
          </div>
        </div>
      </div>

      {/* 4. CEPE SECTION */}
      <div id="cepe" className="py-32 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center mb-20 space-y-6 max-w-4xl mx-auto">
             <h2 className="text-4xl font-black text-zinc-900 tracking-tighter font-sans">HOW WE SCORE</h2>
             <p className="text-zinc-500 font-mono text-sm uppercase tracking-wide">THE CEPE FRAMEWORK — WHAT SEPARATES OPERATORS FROM PASSENGERS.</p>
             
             {/* Thesis Block */}
             <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm mt-8 text-left md:text-center">
                <p className="text-lg md:text-xl text-zinc-600 font-medium leading-relaxed">
                   Traditional assessments judge the code. But when AI writes the code, that's measuring the wrong thing.
                   <br className="hidden md:block" />
                   We judge the prompt — because a good prompt reveals that you understand what you're asking for. A bad prompt just gets lucky.
                </p>
                <div className="mt-4 pt-4 border-t border-zinc-100 text-sm font-bold text-zinc-400 font-mono uppercase tracking-widest">
                   CEPE measures the four dimensions of Agentic Literacy
                </div>
             </div>
          </div>

          {/* Expanded CEPE Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CEPE.map((item, i) => (
              <div key={i} className="bg-white border border-zinc-200 p-8 rounded-2xl hover:shadow-xl hover:border-teal-500/20 transition-all duration-300 flex flex-col h-full">
                   <div className={`w-12 h-12 flex items-center justify-center rounded-xl mb-6 ${item.bg} ${item.color} font-black text-2xl font-mono`}>
                      {item.letter}
                   </div>
                   <h3 className="text-lg font-bold text-zinc-900 mb-2 font-sans uppercase tracking-tight">{item.title}</h3>
                   <p className="text-sm font-bold text-zinc-800 mb-4 font-mono leading-tight border-b border-zinc-100 pb-4">
                     {item.question}
                   </p>
                   <p className="text-sm text-zinc-500 leading-relaxed font-medium flex-grow">
                     {item.explanation}
                   </p>
              </div>
            ))}
          </div>

          {/* The Insight Callout */}
          <div className="mt-16 max-w-2xl mx-auto">
             <div className="bg-zinc-900 rounded-2xl p-8 text-center shadow-2xl shadow-zinc-900/10 border border-zinc-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-purple-500 to-amber-500"></div>
                <h4 className="text-white font-bold font-mono text-sm uppercase tracking-widest mb-4">The Insight</h4>
                <p className="text-xl md:text-2xl font-bold text-white leading-tight font-sans">
                   "A good prompt reveals understanding. <br />
                   <span className="text-zinc-500">A bad prompt gets lucky.</span>"
                </p>
             </div>
          </div>

          {/* Footer Tagline */}
          <div className="mt-16 text-center">
            <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2">
              <Code2 className="w-4 h-4" /> We don't judge the code. We judge the prompt.
            </p>
          </div>
        </div>
      </div>

      {/* 5. WHY THIS MATTERS */}
      <div id="impact" className="bg-zinc-900 text-white py-32 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid md:grid-cols-2 gap-16">
              <div>
                 <h2 className="text-4xl font-black tracking-tighter font-sans mb-6">WHY THIS MATTERS</h2>
                 <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                    Hiring is broken. Recruiters can't tell who's a 10x AI-native developer and who's just copy-pasting prompts. Traditional assessments don't measure the skill that actually matters in a production environment.
                 </p>
              </div>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white shrink-0 border border-zinc-700">
                       <Users className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="font-bold text-lg mb-2">For Developers</h3>
                       <p className="text-zinc-400 text-sm leading-relaxed">
                          Prove you're not just getting lucky. Get a verifiable score that demonstrates you can wield AI as an architectural tool, not just a crutch.
                       </p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white shrink-0 border border-zinc-700">
                       <Target className="w-5 h-5" />
                    </div>
                    <div>
                       <h3 className="font-bold text-lg mb-2">For Hiring</h3>
                       <p className="text-zinc-400 text-sm leading-relaxed">
                          See who actually understands what they're building. VibeBench separates operators from passengers.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 6. LEADERBOARD */}
      <div id="leaderboard" className="max-w-7xl mx-auto px-6 py-32">
         <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <h2 className="text-4xl font-black text-zinc-900 tracking-tighter font-sans">GLOBAL LEADERBOARD</h2>
            {userRank && (
              <div className="px-5 py-3 bg-white rounded-xl border border-zinc-200 flex items-center gap-4 shadow-sm">
                 <span className="text-xs text-zinc-500 font-mono uppercase font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" /> Your Rank
                 </span>
                 <span className="text-xl font-black text-teal-600 font-mono">#{userRank}</span>
              </div>
            )}
         </div>
         <div className="bg-white border border-zinc-200 rounded-3xl p-2 shadow-xl shadow-zinc-200/50">
            <Leaderboard entries={leaderboard} showDomain={true} theme="light" />
         </div>
      </div>

      {/* FOOTER */}
      <footer className="py-12 border-t border-zinc-200 bg-zinc-50 text-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest">
             Built for Google's Vibe Code with Gemini 3 Pro hackathon by Aitch0011
          </p>
          <div className="flex items-center gap-6">
             <a href="https://threads.net" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-teal-600 font-mono text-[10px] uppercase tracking-widest border-b border-transparent hover:border-teal-600 transition-colors">
               @Aitch0011 on Threads
             </a>
             <a href="https://github.com/aitch0011" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-teal-600 font-mono text-[10px] uppercase tracking-widest border-b border-transparent hover:border-teal-600 transition-colors flex items-center gap-1">
               <Github className="w-3 h-3" /> @Aitch0011 on GitHub
             </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
