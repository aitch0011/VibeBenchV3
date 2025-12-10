import React, { useEffect, useState } from 'react';
import { Target, TrendingUp, Loader2 } from 'lucide-react';

interface Props {
  percentile: number;
}

export const PercentileGauge: React.FC<Props> = ({ percentile }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [status, setStatus] = useState<'calculating' | 'animating' | 'done'>('calculating');

  useEffect(() => {
    // Reset state when percentile prop changes
    setStatus('calculating');
    setDisplayValue(0);

    // Initial suspense delay
    const delayTimer = setTimeout(() => {
      setStatus('animating');
    }, 1500);

    return () => clearTimeout(delayTimer);
  }, [percentile]);

  useEffect(() => {
    if (status !== 'animating') return;

    let startTimestamp: number;
    const duration = 2500; // Slow fill for suspense

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      // Ease out quart for a satisfying mechanical feel
      const ease = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(percentile * ease);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setStatus('done');
      }
    };

    window.requestAnimationFrame(step);
  }, [status, percentile]);

  // Determine tier colors
  const getTheme = (val: number) => {
    if (val >= 90) return {
        bar: 'bg-emerald-500', 
        shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10'
    };
    if (val >= 70) return {
        bar: 'bg-indigo-500', 
        shadow: 'shadow-[0_0_20px_rgba(99,102,241,0.4)]',
        text: 'text-indigo-400',
        bg: 'bg-indigo-500/10'
    };
    return {
        bar: 'bg-amber-500', 
        shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10'
    };
  };

  const roundedValue = Math.round(displayValue);
  const theme = getTheme(roundedValue);
  const widthPercentage = Math.min(Math.max(displayValue, 2), 100);

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-3">
       {/* Labels */}
       <div className="flex justify-between items-end px-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white/40 uppercase tracking-widest">
             <Target className="w-3.5 h-3.5" />
             <span>Global Percentile</span>
          </div>
          <div className={`text-4xl font-black font-mono leading-none tracking-tighter transition-colors duration-300 ${status === 'calculating' ? 'text-white/20' : theme.text}`}>
             {status === 'calculating' ? (
               <span className="flex items-center gap-2 text-lg"><Loader2 className="w-5 h-5 animate-spin" /> CALC</span>
             ) : (
               <>{roundedValue}<span className="text-lg ml-0.5 opacity-60">%</span></>
             )}
          </div>
       </div>

       {/* Progress Bar Container */}
       <div className="h-4 bg-black/40 rounded-full border border-white/10 p-1 relative overflow-hidden shadow-inner">
          {/* Background Tick Marks */}
          <div className="absolute inset-0 w-full h-full flex justify-between px-2 pointer-events-none opacity-20">
             {[...Array(20)].map((_, i) => (
                <div key={i} className="w-[1px] h-full bg-white/30" />
             ))}
          </div>

          {/* Animated Bar */}
          <div 
            className={`h-full rounded-full transition-all duration-75 ease-out relative ${status === 'calculating' ? 'w-full bg-white/5 animate-pulse' : `${theme.bar} ${theme.shadow}`}`}
            style={status === 'calculating' ? {} : { width: `${widthPercentage}%` }}
          >
             {status !== 'calculating' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-1/2 -skew-x-12 translate-x-[-200%] animate-[shimmer_2s_infinite_linear]" />
             )}
          </div>
       </div>

       {/* Bottom Context */}
       <div className="flex justify-between items-center px-1 h-5">
          <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest">
             Baseline: 50%
          </div>
          {status === 'done' && (
             <div className={`text-[10px] font-mono uppercase tracking-widest font-bold flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-1 ${theme.text}`}>
                <TrendingUp className="w-3 h-3" />
                Top {100 - roundedValue}% of operators
             </div>
          )}
       </div>

       <style>{`
         @keyframes shimmer {
           0% { transform: translateX(-200%) skewX(-12deg); }
           100% { transform: translateX(400%) skewX(-12deg); }
         }
       `}</style>
    </div>
  );
};