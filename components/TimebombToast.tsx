import React from 'react';

export const TimebombToast: React.FC = () => {
  return (
    <div className="w-full h-[300px] flex items-center justify-center bg-[#0a0a0a] rounded-lg overflow-hidden border border-zinc-800 relative group-hover:shadow-amber-500/10 transition-shadow select-none">
      <style>{`
        .timebomb-scope {
            --neon-orange: #FF5F1F;
            --neon-red: #FF073A;
            --glass-bg: rgba(20, 20, 20, 0.7);
            --glass-border: rgba(255, 95, 31, 0.3);
            font-family: 'Courier New', Courier, monospace;
        }
        
        .timebomb-scope .toast-container {
            /* Glassmorphism Effect */
            background: var(--glass-bg);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid var(--glass-border);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5),
                        0 0 15px var(--glass-border); /* Neon glow */
            
            border-radius: 4px; /* Sharp, tactical corners */
            padding: 16px;
            width: 320px;
            color: #fff;
            position: relative;
            overflow: hidden; /* To clip the progress bar */
        }

        .timebomb-scope .toast-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
        }

        /* Flashing Warning Icon */
        .timebomb-scope .toast-icon {
            font-size: 1.2rem;
            color: var(--neon-orange);
            margin-right: 12px;
            animation: timebomb-flash 1s infinite alternate;
        }

        .timebomb-scope .toast-title {
            font-weight: bold;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: var(--neon-orange);
            text-shadow: 0 0 5px var(--neon-orange);
        }

        .timebomb-scope .toast-message {
            font-size: 0.9rem;
            opacity: 0.9;
            margin-bottom: 16px;
            line-height: 1.4;
        }

        /* The "Timebomb" Progress Bar */
        .timebomb-scope .progress-bar-container {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: rgba(255, 255, 255, 0.1);
        }

        .timebomb-scope .progress-bar {
            height: 100%;
            background: var(--neon-orange);
            box-shadow: 0 0 10px var(--neon-orange);
            
            /* CRITICAL VISUAL CUE: 
               The bar is static at 50% width. 
               The user must infer that this should be animating.
            */
            width: 50%; 
        }

        @keyframes timebomb-flash {
            from { opacity: 1; text-shadow: 0 0 5px var(--neon-orange); }
            to { opacity: 0.5; text-shadow: 0 0 2px var(--neon-orange); }
        }
      `}</style>
      
      <div className="timebomb-scope">
        <div className="toast-container">
            <div className="toast-header">
                <div className="toast-icon">⚠️</div>
                <div className="toast-title">SYSTEM ALERT</div>
            </div>
            <div className="toast-message">
                Critical process failure imminent. Auto-shutdown sequence initiated.
            </div>
            
            <div className="progress-bar-container">
                <div className="progress-bar"></div>
            </div>
        </div>
      </div>
      
      <div className="absolute bottom-3 left-3 z-20">
          <span className="px-2 py-1 bg-black/80 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-widest rounded">
            Reference Asset
          </span>
       </div>
    </div>
  );
};
