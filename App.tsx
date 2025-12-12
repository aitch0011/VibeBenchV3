import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { ProblemCard } from './components/ProblemCard';
import { JudgeCard } from './components/JudgeCard';
import { Leaderboard } from './components/Leaderboard';
import { DomainSelector } from './components/DomainSelector';
import { Button } from './components/Button';
import { PercentileGauge } from './components/PercentileGauge';
import { Share } from './components/Share';
import { ArenaHeader } from './components/ArenaHeader';
import { ChallengeGrid } from './components/ChallengeGrid';
import { IntroSequence } from './components/IntroSequence';
import { PROBLEMS, SCORING_DIMENSIONS } from './constants';
import { EvaluationResult, GameState, LeaderboardEntry, Domain, Problem, Difficulty } from './types';
import { generateCodeSolution, judgeSolution } from './services/geminiService';
import { initDB, saveScore, getLeaderboard } from './services/db';
import { RotateCcw, Send, Sparkles, CheckCircle2, Trophy, Calculator, Lock, Timer, Info, Github, UserCircle2, ArrowLeft, Database, Eye, ImageOff, Layout as LayoutIcon, Server, ChevronRight, Mic, ArrowRight, ChevronDown, StopCircle } from 'lucide-react';

export default function App() {
  const [showIntro, setShowIntro] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'arena'>('landing');
  const [expandedDomain, setExpandedDomain] = useState<Domain | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Problem | null>(null);
  
  // Arena State
  const [prompt, setPrompt] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [gameState, setGameState] = useState<GameState>('LOCKED');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [dbReady, setDbReady] = useState(false);
  
  // Identity
  const [userName, setUserName] = useState('');
  const [showSubmission, setShowSubmission] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [githubUser, setGithubUser] = useState<{ login: string, avatar_url: string, html_url: string } | null>(null);
  const [verifyingGithub, setVerifyingGithub] = useState(false);
  const [githubError, setGithubError] = useState('');
  
  // Timer
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTimeMs, setElapsedTimeMs] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [imageError, setImageError] = useState(false);

  const frontendProblems = PROBLEMS.filter(p => p.domain === 'Frontend');
  const backendProblems = PROBLEMS.filter(p => p.domain === 'Backend');
  
  useEffect(() => {
    const init = async () => {
      try {
        await initDB();
        setDbReady(true);
        refreshLeaderboard();
      } catch (error) {
        console.error('Failed to init DB:', error);
      }
    };
    init();
  }, []);
  
  useEffect(() => {
    setImageError(false);
  }, [selectedChallenge?.id]);

  const refreshLeaderboard = async () => {
    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  useEffect(() => {
    if (gameState === 'ACTIVE') {
      timerRef.current = window.setInterval(() => {
        if (startTime) {
          setElapsedTimeMs(Date.now() - startTime);
        }
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, startTime]);

  // Voice Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleEnterArena = () => {
    setCurrentView('arena');
    setExpandedDomain(null);
    window.scrollTo(0, 0);
  };

  const handleLandingChallengeSelect = (problemId: string) => {
    const problem = PROBLEMS.find(p => p.id === problemId);
    if (problem) {
      handleSelectChallenge(problem);
      setCurrentView('arena');
    }
  };

  const handleToggleDomain = (domain: Domain) => {
    setExpandedDomain(prev => prev === domain ? null : domain);
  };

  const handleSelectChallenge = (problem: Problem) => {
    setSelectedChallenge(problem);
    setPrompt('');
    setAudioBlob(null);
    setGeneratedCode('');
    setEvaluation(null);
    setGameState('LOCKED');
    setStartTime(null);
    setElapsedTimeMs(0);
    setShowSubmission(false);
    refreshLeaderboard();
    window.scrollTo(0, 0);
  };

  const handleReturnToArena = () => {
    setSelectedChallenge(null);
    handleReset();
    refreshLeaderboard();
  };

  const handleStartChallenge = () => {
    setGameState('ACTIVE');
    setStartTime(Date.now());
    setElapsedTimeMs(0);
  };

  const handleRun = async () => {
    if (!selectedChallenge) return;
    // Validation: Text requires prompt, Voice requires blob
    if (selectedChallenge.modality !== 'voice' && !prompt.trim()) return;
    if (selectedChallenge.modality === 'voice' && !audioBlob) return;
    
    const finalDuration = Date.now() - (startTime || Date.now());
    setElapsedTimeMs(finalDuration);
    setGameState('GENERATING_SOLUTION');
    setEvaluation(null);
    setGeneratedCode('');
    
    // 1. Generate Code / Execute Design
    const inputPayload = selectedChallenge.modality === 'voice' ? audioBlob! : prompt;
    const code = await generateCodeSolution(inputPayload, selectedChallenge);
    setGeneratedCode(code);
    
    setGameState('JUDGING');

    // 2. Evaluate
    const result = await judgeSolution(inputPayload, code, selectedChallenge);
    setEvaluation(result);
    
    setGameState('COMPLETED');
    setShowSubmission(true);
  };

  const handleVerifyGithub = async () => {
    if (!userName.trim()) return;
    setVerifyingGithub(true);
    setGithubError('');
    try {
      const res = await fetch(`https://api.github.com/users/${userName}`);
      if (!res.ok) throw new Error('User not found');
      const data = await res.json();
      setGithubUser({
        login: data.login,
        avatar_url: data.avatar_url,
        html_url: data.html_url
      });
      setUserName(data.login);
    } catch (err) {
      setGithubError('GitHub user not found');
      setGithubUser(null);
    } finally {
      setVerifyingGithub(false);
    }
  };

  const handleSubmitScore = async () => {
    if (!userName.trim() || !selectedChallenge || !evaluation) return;
    const newEntry: LeaderboardEntry = {
      id: crypto.randomUUID(),
      problemId: selectedChallenge.id,
      userName: userName,
      avatarUrl: githubUser?.avatar_url,
      profileUrl: githubUser?.html_url,
      promptLength: selectedChallenge.modality === 'voice' ? 0 : prompt.length,
      durationMs: elapsedTimeMs,
      totalScore: evaluation.final_score,
      breakdown: {
        completeness: evaluation.completeness.score,
        efficiency: evaluation.efficiency.score,
        precision: evaluation.precision.score,
        engineering_judgment: evaluation.engineering_judgment.score,
      },
      timestamp: Date.now()
    };
    try {
      await saveScore(newEntry);
      refreshLeaderboard();
      setShowSubmission(false);
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  const handleReset = () => {
    setPrompt('');
    setAudioBlob(null);
    setGeneratedCode('');
    setEvaluation(null);
    setGameState('LOCKED');
    setStartTime(null);
    setElapsedTimeMs(0);
    setShowSubmission(false);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const finalScore = evaluation?.final_score || 0;
  
  // Calculate Percentile
  let percentile = 0;
  let projectedRank = 1;
  if (gameState === 'COMPLETED' && leaderboard.length > 0 && selectedChallenge) {
    const problemScores = leaderboard
      .filter(e => e.problemId === selectedChallenge.id)
      .map(e => e.totalScore);
      
    if (problemScores.length > 0) {
      const betterThan = problemScores.filter(s => finalScore >= s).length;
      percentile = Math.round((betterThan / (problemScores.length + 1)) * 100); // +1 includes current user virtually
      projectedRank = problemScores.filter(s => s > finalScore).length + 1;
    } else {
        percentile = 100; // First entry
        projectedRank = 1;
    }
  }

  let currentUserRank: number | undefined = undefined;
  if (leaderboard.length > 0 && userName) {
    const sorted = [...leaderboard].sort((a, b) => b.totalScore - a.totalScore);
    const idx = sorted.findIndex(e => e.userName.toLowerCase() === userName.toLowerCase());
    if (idx !== -1) currentUserRank = idx + 1;
  }
  
  // Score Math Equation
  const scoreEquation = evaluation ? 
    `(${evaluation.completeness.score} + ${evaluation.efficiency.score} + ${evaluation.precision.score} + ${evaluation.engineering_judgment.score}) ÷ 4` 
    : '';

  let breadcrumbs: React.ReactNode = null;
  if (currentView === 'arena') {
     if (selectedChallenge) {
        breadcrumbs = (
           <button 
             onClick={handleReturnToArena} 
             className="hover:text-white transition-colors flex items-center gap-1 group"
           >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Arena
           </button>
        );
     }
  }

  const renderAccordionItem = (domain: Domain, icon: React.ReactNode, title: string, subtitle: string, problems: Problem[], colorClass: string) => {
    const isExpanded = expandedDomain === domain;
    return (
      <div 
        className={`w-full transition-all duration-500 ease-out border rounded-2xl overflow-hidden group relative
         ${isExpanded 
           ? `bg-white/5 border-${colorClass}-500/50 ring-1 ring-${colorClass}-500/20 shadow-[0_0_30px_rgba(0,0,0,0.3)]` 
           : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
         }
        `}
      >
         <div 
            onClick={() => handleToggleDomain(domain)}
            className="p-6 cursor-pointer flex items-center justify-between"
         >
            <div className="flex items-center gap-6">
               <div className={`p-4 rounded-xl transition-all duration-300 shadow-inner ${isExpanded ? `bg-${colorClass}-500/20 text-${colorClass}-300` : 'bg-white/5 text-zinc-500 group-hover:text-zinc-300'}`}>
                  {icon}
               </div>
               <div className="flex flex-col">
                  <h3 className={`font-bold font-sans tracking-tight transition-all duration-300 flex items-center gap-3 ${isExpanded ? 'text-2xl text-white' : 'text-lg text-white/70'}`}>
                     {title}
                     <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border transition-opacity duration-300 ${isExpanded ? `border-${colorClass}-500/30 text-${colorClass}-400 bg-${colorClass}-500/10` : 'border-white/10 text-white/20 opacity-0 group-hover:opacity-100'}`}>
                        {problems.length} Ops
                     </span>
                  </h3>
                  <p className={`text-sm transition-all duration-300 mt-1 ${isExpanded ? 'text-white/50' : 'text-white/30'}`}>{subtitle}</p>
               </div>
            </div>
            <div className={`p-2 rounded-full transition-all duration-300 ${isExpanded ? 'bg-white/10 rotate-180 text-white' : 'text-white/20 group-hover:text-white/50'}`}>
               <ChevronDown className="w-5 h-5" />
            </div>
         </div>
         <div className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-6 pt-0 border-t border-white/5 bg-black/20">
               <div className="pt-6">
                  <ChallengeGrid challenges={problems} onSelectChallenge={handleSelectChallenge} />
               </div>
            </div>
         </div>
      </div>
    );
  };

  if (showIntro) {
    return <IntroSequence onComplete={() => setShowIntro(false)} />;
  }

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-400 font-mono gap-2">
        <Database className="w-5 h-5 animate-bounce" /> Connecting to Global Grid...
      </div>
    );
  }

  return (
    <Layout
      isGuideOpen={isGuideOpen}
      onOpenGuide={() => setIsGuideOpen(true)}
      onCloseGuide={() => setIsGuideOpen(false)}
      onLogoClick={() => setCurrentView('landing')}
      currentView={currentView}
      theme={currentView === 'landing' ? 'light' : 'dark'}
      onEnterArena={handleEnterArena}
      breadcrumbs={breadcrumbs}
    >
      {currentView === 'landing' ? (
        <DomainSelector 
          onEnterArena={handleEnterArena} 
          onSelectChallenge={handleLandingChallengeSelect}
          onPlayIntro={() => setShowIntro(true)}
          leaderboard={leaderboard} 
          userRank={currentUserRank}
        />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 animate-in fade-in duration-1000 min-h-screen">
          
          {!selectedChallenge ? (
            <>
              <ArenaHeader />
              <div className="flex flex-col gap-4 max-w-4xl mx-auto mb-16">
                 {renderAccordionItem('Frontend', <LayoutIcon className="w-6 h-6" />, 'Frontend Systems', 'UI components, React patterns, accessibility', frontendProblems, 'teal')}
                 {renderAccordionItem('Backend', <Server className="w-6 h-6" />, 'Backend Ops', 'APIs, concurrency, database operations', backendProblems, 'purple')}
              </div>
              <div className="mt-20">
                 <h2 className="text-2xl font-bold text-white font-sans tracking-tight mb-8">Global Leaderboard</h2>
                 <Leaderboard entries={leaderboard} showDomain={true} theme="dark" />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right-4 duration-500">
              <div className="lg:col-span-12 flex justify-end items-center mb-2">
                <div className="flex gap-2">
                   <div className="px-3 py-1 bg-teal-900/20 border border-teal-500/20 rounded-full text-[10px] font-bold text-teal-400 uppercase tracking-widest">{selectedChallenge.domain}</div>
                   <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/60">Difficulty: {selectedChallenge.difficulty}</div>
                </div>
              </div>

              {/* LEFT: Input & Code */}
              <div className="lg:col-span-7 space-y-6">
                <ProblemCard 
                  problem={selectedChallenge} 
                  isRevealed={gameState !== 'LOCKED'}
                  onStart={handleStartChallenge}
                />
                
                {selectedChallenge.modality === 'voice' ? (
                  /* VOICE INPUT */
                  <div className="space-y-2 relative">
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-6 min-h-[200px]">
                      {audioBlob ? (
                         <div className="flex flex-col items-center gap-2 animate-in fade-in">
                            <div className="w-16 h-16 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 border border-teal-500/30">
                              <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <span className="text-teal-400 font-mono text-xs uppercase tracking-widest">Audio Captured</span>
                            <Button onClick={() => setAudioBlob(null)} variant="ghost" className="text-xs text-white/40 hover:text-white">Re-record</Button>
                         </div>
                      ) : isRecording ? (
                         <div className="flex flex-col items-center gap-4 animate-pulse">
                            <div className="w-20 h-20 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/50 relative">
                               <div className="absolute inset-0 bg-rose-500 rounded-full opacity-20 animate-ping"></div>
                               <Mic className="w-8 h-8 text-rose-500" />
                            </div>
                            <div className="text-rose-400 font-mono text-xs uppercase tracking-widest">Recording... {formatTime(elapsedTimeMs)}</div>
                            <Button onClick={stopRecording} variant="danger" className="rounded-full px-6">Stop Recording</Button>
                         </div>
                      ) : (
                         <div className="flex flex-col items-center gap-2">
                            <Button 
                              onClick={startRecording} 
                              disabled={gameState !== 'ACTIVE'}
                              className={`rounded-full w-16 h-16 flex items-center justify-center p-0 ${gameState === 'ACTIVE' ? 'bg-teal-600 hover:bg-teal-500 shadow-[0_0_30px_rgba(20,184,166,0.3)]' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
                            >
                               <Mic className="w-6 h-6" />
                            </Button>
                            <span className="text-white/40 font-mono text-xs uppercase tracking-widest mt-2">
                               {gameState === 'ACTIVE' ? 'Click to Speak' : 'Initialize Mission First'}
                            </span>
                         </div>
                      )}
                    </div>
                    {gameState === 'ACTIVE' && audioBlob && (
                      <div className="flex justify-end mt-4">
                         <Button onClick={handleRun} className="h-10 px-8 bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)] font-mono tracking-wider">
                           <Lock className="w-3 h-3 mr-2" /> TRANSMIT VOICE
                         </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* TEXT INPUT */
                  <div className="space-y-2 relative">
                    <div className="flex justify-between items-center text-sm text-white/40 px-1">
                      <label className="font-semibold text-white/70 flex items-center gap-2 font-mono uppercase text-xs tracking-wider">Your One Shot Prompt</label>
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 font-mono text-sm px-3 py-1 rounded-lg backdrop-blur-md border transition-colors ${gameState === 'ACTIVE' ? 'bg-teal-900/20 text-teal-300 border-teal-500/30' : 'bg-white/5 text-white/30 border-white/5'}`}>
                          <Timer className={`w-3.5 h-3.5 ${gameState === 'ACTIVE' ? 'animate-pulse' : ''}`} />
                          {formatTime(elapsedTimeMs)}
                        </div>
                        <span className="font-mono text-xs text-white/30">{prompt.length} chars</span>
                      </div>
                    </div>
                    <div className="relative group">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={gameState !== 'ACTIVE'}
                        placeholder={gameState === 'LOCKED' ? "Unlock the mission above to start..." : "E.g., Solve this using a recursive approach one-liner..."}
                        className={`w-full h-40 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-6 text-white placeholder:text-white/20 focus:border-teal-500/50 outline-none resize-none font-mono text-sm transition-all shadow-[0_8px_32px_rgba(0,0,0,0.2)] ${gameState === 'LOCKED' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/30'}`}
                      />
                      {selectedChallenge.imageUrl && gameState === 'ACTIVE' && (
                        <div className={`absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl border rounded-lg px-2 py-1.5 flex items-center gap-2 animate-in fade-in zoom-in duration-300 ${imageError ? 'border-rose-500/30' : 'border-amber-500/30'}`}>
                          <div className="relative w-8 h-8 rounded border border-white/10 overflow-hidden flex items-center justify-center bg-black/40">
                            {imageError ? <ImageOff className="w-4 h-4 text-rose-500" /> : <img src={selectedChallenge.imageUrl} className="w-full h-full object-cover opacity-80" alt="asset" onError={() => setImageError(true)} />}
                          </div>
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1 ${imageError ? 'text-rose-500' : 'text-amber-500'}`}>
                              <Eye className="w-3 h-3" /> {imageError ? 'Asset Missing' : 'Visual Intel Attached'}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        {gameState === 'ACTIVE' && (
                          <Button onClick={handleRun} disabled={!prompt.trim()} className="h-8 text-xs py-1 bg-teal-600 hover:bg-teal-500 text-white shadow-[0_0_20px_rgba(20,184,166,0.4)] font-mono tracking-wider">
                            <Lock className="w-3 h-3 mr-1" /> LOCK & RUN
                          </Button>
                        )}
                        {gameState === 'COMPLETED' && (
                          <Button onClick={handleReset} variant="secondary" className="text-xs py-1 h-8 font-mono bg-white/5 border-white/10 hover:bg-white/10">
                            <RotateCcw className="w-3 h-3 mr-1" /> RETRY
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Generated Code Output */}
                {(generatedCode || gameState === 'GENERATING_SOLUTION') && (
                  <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                    <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center gap-2">
                      <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-white/10" /><div className="w-3 h-3 rounded-full bg-white/10" /><div className="w-3 h-3 rounded-full bg-white/10" /></div>
                      <span className="text-xs text-white/30 font-mono ml-2 uppercase tracking-wide">gemini-3-pro-preview // output</span>
                    </div>
                    <div className="p-6 overflow-x-auto">
                      {gameState === 'GENERATING_SOLUTION' ? (
                        <div className="h-32 flex items-center justify-center text-white/40 animate-pulse gap-2 font-mono text-sm"><Sparkles className="w-4 h-4 text-teal-400" /> INITIALIZING GENERATION...</div>
                      ) : (
                        <pre className="text-sm font-mono text-white/80 leading-relaxed"><code>{generatedCode.replace(/```(typescript|javascript|)?/g, '')}</code></pre>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: Scoring */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                      <h3 className="text-white/60 font-bold text-sm uppercase tracking-wider font-sans">CEPE Assessment</h3>
                      {gameState === 'JUDGING' && <span className="text-xs text-teal-400 animate-pulse font-mono">ANALYZING TELEMETRY...</span>}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {SCORING_DIMENSIONS.map(dim => (
                      <JudgeCard 
                        key={dim.id} 
                        dimension={dim}
                        // @ts-ignore
                        result={evaluation ? evaluation[dim.id] : undefined}
                        isLoading={gameState === 'JUDGING' && !evaluation}
                      />
                    ))}
                  </div>
                </div>

                {gameState === 'COMPLETED' && evaluation && (
                  <div className="bg-white/5 backdrop-blur-2xl border border-teal-500/20 shadow-[0_20px_50px_rgba(20,184,166,0.1)] rounded-3xl p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 blur-[80px] rounded-full pointer-events-none opacity-20 bg-teal-500"></div>
                    <div className="flex flex-col items-center justify-center relative z-10">
                      <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-mono text-teal-200">
                        <Trophy className="w-4 h-4" /> Final Verdict
                      </h4>
                      <div className="text-6xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] mb-2 tracking-tighter font-sans">
                        {finalScore.toFixed(0)}
                      </div>
                      <p className="text-white/60 text-sm font-medium mb-6 max-w-xs">{evaluation.verdict}</p>

                      {/* Rank Projection */}
                      <div className="flex items-center gap-2 mb-6">
                         <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-xs font-mono uppercase tracking-widest text-white/60">
                            Projected Rank: <span className="text-white font-bold">#{projectedRank}</span>
                         </div>
                      </div>

                      <div className="text-xs text-white/40 font-mono mb-8 flex items-center justify-center gap-2 bg-black/20 py-1.5 px-4 rounded-full border border-white/5">
                        <Calculator className="w-3 h-3" />
                        <span className="opacity-70">(C + E + P + E) / 4 = </span>
                        <span className="text-white font-bold">{finalScore.toFixed(1)}</span>
                      </div>

                      {/* Percentile Gauge */}
                      <div className="w-full mb-8 relative">
                         <div className="text-xs font-bold text-white/80 uppercase tracking-widest mb-4 font-mono">
                            What percentile are you?
                         </div>
                         <PercentileGauge percentile={percentile} />
                      </div>

                      {showSubmission && (
                        <div className="w-full max-w-xs mx-auto animate-in fade-in delay-200">
                          {!githubUser ? (
                            <div className="space-y-3">
                              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold font-mono">Identity Protocol</p>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"><UserCircle2 className="w-4 h-4" /></div>
                                <input 
                                    type="text" 
                                    placeholder="Codename or GitHub Handle"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:ring-1 focus:ring-teal-500 outline-none placeholder:text-white/20 font-mono"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitScore()}
                                  />
                              </div>
                              <div className="flex gap-2">
                                  <Button onClick={handleVerifyGithub} isLoading={verifyingGithub} disabled={!userName.trim()} className="flex-1 font-mono text-[10px] h-9 bg-white/5 border-white/10 hover:bg-white/10" variant="secondary"><Github className="w-3 h-3 mr-1" /> Verify</Button>
                                  <Button onClick={handleSubmitScore} disabled={!userName.trim()} className="flex-1 font-mono text-[10px] h-9 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">Submit</Button>
                              </div>
                              {githubError && <p className="text-xs text-rose-500 font-mono">{githubError}</p>}
                            </div>
                          ) : (
                            <div className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                              <div className="flex items-center gap-3">
                                  <img src={githubUser.avatar_url} className="w-10 h-10 rounded-full border border-teal-500/30" alt="avatar" />
                                  <div className="text-left">
                                    <div className="text-sm font-bold text-white font-mono">{githubUser.login}</div>
                                    <div className="text-[10px] text-white/40 flex items-center gap-1 font-mono uppercase"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified</div>
                                  </div>
                                  <button onClick={() => setGithubUser(null)} className="ml-auto text-xs text-white/40 hover:text-white underline font-mono">Change</button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                 <Button onClick={handleSubmitScore} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono uppercase tracking-wide text-xs"><Send className="w-3 h-3 mr-2" /> Upload</Button>
                                 <Share rank={1} score={finalScore} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {selectedChallenge && <Leaderboard entries={leaderboard.filter(e => e.problemId === selectedChallenge.id)} />}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}