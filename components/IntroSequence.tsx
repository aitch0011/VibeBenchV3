
import React, { useEffect, useState } from 'react';
import { SCORING_DIMENSIONS } from '../constants';
import { CheckCircle2, Zap, Target, Brain } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

const IconMap: Record<string, any> = {
  CheckCircle2,
  Zap,
  Target,
  Brain
};

export const IntroSequence: React.FC<Props> = ({ onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [bgStatus, setBgStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [showBoxes, setShowBoxes] = useState(false);
  const [visibleBoxCount, setVisibleBoxCount] = useState(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let frameId: number;
    let cancelled = false;

    // Helper: Type text character by character over a duration
    const typeText = (text: string, duration: number) => new Promise<void>(resolve => {
        const start = Date.now();
        const len = text.length;
        
        const tick = () => {
            if (cancelled) return;
            const now = Date.now();
            const progress = Math.min((now - start) / duration, 1);
            
            // Linear typing for precise timing control
            const charCount = Math.floor(progress * len);
            
            setDisplayedText(text.substring(0, charCount));
            
            if (progress < 1) {
                frameId = requestAnimationFrame(tick);
            } else {
                setDisplayedText(text);
                resolve();
            }
        };
        frameId = requestAnimationFrame(tick);
    });

    // Helper: Delete text character by character
    const deleteText = (text: string, duration: number) => new Promise<void>(resolve => {
         const start = Date.now();
         const len = text.length;
         
         const tick = () => {
            if (cancelled) return;
            const now = Date.now();
            const progress = Math.min((now - start) / duration, 1);
            const charCount = Math.floor(len * (1 - progress));
            
            setDisplayedText(text.substring(0, charCount));
            
            if (progress < 1) {
                frameId = requestAnimationFrame(tick);
            } else {
                setDisplayedText('');
                resolve();
            }
         };
         frameId = requestAnimationFrame(tick);
    });
    
    // Helper: Wait for a duration
    const wait = (ms: number) => new Promise<void>(resolve => {
        timeoutId = setTimeout(resolve, ms);
    });

    const runSequence = async () => {
        // 1. "2022"
        await typeText("2022", 1500); // Faster
        await wait(500);
        await deleteText("2022", 500);
        
        await wait(100);

        // 2. "2024"
        await typeText("2024", 1500); // Faster
        await wait(1000);
        await deleteText("2024", 500);
        
        await wait(100);

        // 3. "2025?"
        await typeText("2025?", 1500); // Faster
        await wait(600); // Added pause so it registers visually
        await deleteText("2025?", 300); 

        // 4. "CODING IS SOLVED."
        await typeText("CODING IS SOLVED.", 2000);
        
        await wait(1500);
        
        await deleteText("CODING IS SOLVED.", 800);
        await wait(300);

        // 5. "THE BOTTLENECK\nIS YOU"
        await typeText("THE BOTTLENECK\nIS YOU", 2500);
        
        await wait(2000);
        
        await deleteText("THE BOTTLENECK\nIS YOU", 1000);
        await wait(300);

        // 6. "WHO CAN DIRECT IT BEST?"
        await typeText("WHO CAN DIRECT IT BEST?", 2000);
        
        await wait(2000);
        
        await deleteText("WHO CAN DIRECT IT BEST?", 800);
        await wait(500);

        // 7. "PROVE YOU CAN COMMUNICATE ACROSS EVERY MODALITY"
        await typeText("PROVE YOU CAN COMMUNICATE\nACROSS EVERY MODALITY", 3000);
        await wait(2500);
        await deleteText("PROVE YOU CAN COMMUNICATE\nACROSS EVERY MODALITY", 1000);
        await wait(300);

        // 8. "LEETCODE IS DEAD"
        await typeText("LEETCODE IS DEAD", 2000);
        await wait(2000);
        await deleteText("LEETCODE IS DEAD", 800);
        await wait(300);

        // 9. "ROBOTIC" (Instant & Disappear)
        setDisplayedText("ROBOTIC");
        await wait(1500);
        setDisplayedText(""); // Disappear
        await wait(300);

        // 10. "BORING" (Instant & Disappear)
        setDisplayedText("BORING");
        await wait(1500);
        setDisplayedText(""); // Disappear
        await wait(300);

        // 11. "THEY ARE THE PAST" (Instant & Disappear)
        setDisplayedText("THEY ARE THE PAST");
        await wait(2000);
        setDisplayedText(""); // Disappear
        await wait(500);
        
        // 12. TRANSITION TO BOXES
        setShowBoxes(true);
        await wait(500);
        
        // Reveal boxes 1 by 1
        setVisibleBoxCount(1);
        await wait(800);
        setVisibleBoxCount(2);
        await wait(800);
        setVisibleBoxCount(3);
        await wait(800);
        setVisibleBoxCount(4);
        
        await wait(3000);
        
        if (!cancelled) onComplete();
    };

    runSequence();

    return () => {
        cancelled = true;
        clearTimeout(timeoutId);
        cancelAnimationFrame(frameId);
    };
  }, [onComplete]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black font-sans cursor-pointer overflow-hidden" 
      onClick={onComplete}
    >
      {/* Background Image Layer: Vast, Futuristic Nature */}
      <div className="absolute inset-0 z-0">
          <img 
            src="https://vgpumykbihcvuvzxwcue.supabase.co/storage/v1/object/public/Vibebench/Cool%20Sky.jpg" 
            alt="Vast Landscape" 
            onLoad={() => setBgStatus('loaded')}
            onError={() => setBgStatus('error')}
            className={`w-full h-full object-cover scale-105 animate-[pulse_10s_ease-in-out_infinite] transition-opacity duration-1000 ${
                bgStatus === 'loaded' ? 'opacity-60' : 'opacity-0'
            }`}
          />
          {/* Dark Overlay to make text pop */}
          <div className="absolute inset-0 bg-black/70"></div>
          {/* Gradient Tint */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 via-transparent to-teal-900/40 mix-blend-overlay"></div>
      </div>

      {/* Background Gradient Orbs - Always visible as fallback */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/30 via-transparent to-teal-600/30 blur-3xl opacity-60 animate-pulse z-0"></div>
      
      {/* Content Container */}
      {!showBoxes ? (
          <div className="relative z-10 text-center px-4 w-full max-w-7xl mx-auto">
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-tight select-none relative inline-block break-words max-w-full whitespace-pre-wrap">
              
              {/* Layer 1: The Liquid Glow (Blurred behind) */}
              <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400 blur-lg opacity-60 select-none animate-pulse" aria-hidden="true">
                {displayedText}
              </span>
              
              {/* Layer 2: Main Text with Glassy Gradient */}
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/50 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-sm">
                {displayedText}
              </span>

              {/* Cursor */}
              <span className="inline-block w-2 md:w-5 h-[0.8em] bg-teal-400 align-baseline ml-2 md:ml-4 animate-pulse shadow-[0_0_20px_rgba(45,212,191,0.8)] rounded-sm"></span>
            </h1>
          </div>
      ) : (
          <div className="relative z-10 w-full max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SCORING_DIMENSIONS.map((dim, i) => {
                 const Icon = IconMap[dim.iconName];
                 const isVisible = i < visibleBoxCount;
                 return (
                     <div key={dim.id} className={`
                        bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center gap-4 transition-all duration-700 transform hover:bg-white/10 hover:scale-105
                        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
                     `}>
                         <div className={`p-4 rounded-full ${dim.bg} ${dim.color} mb-2 shadow-[0_0_20px_rgba(0,0,0,0.2)]`}>
                            <Icon className="w-8 h-8" />
                         </div>
                         <div className="text-5xl font-black font-mono text-white tracking-tighter drop-shadow-lg">{dim.letter}</div>
                         <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">{dim.label}</h3>
                         <p className="text-xs text-white/60 font-medium leading-relaxed">{dim.description}</p>
                     </div>
                 )
              })}
          </div>
      )}
    </div>
  );
};
