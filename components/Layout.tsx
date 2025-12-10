import React, { useEffect, useState } from 'react';
import { Terminal, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from './Button';
import { FieldGuide } from './FieldGuide';

interface LayoutProps {
  children: React.ReactNode;
  isGuideOpen: boolean;
  onOpenGuide: () => void;
  onCloseGuide: () => void;
  onLogoClick?: () => void;
  currentView: 'landing' | 'arena';
  theme: 'light' | 'dark';
  onEnterArena: () => void;
  breadcrumbs?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  isGuideOpen, 
  onOpenGuide, 
  onCloseGuide,
  onLogoClick,
  currentView,
  theme,
  onEnterArena,
  breadcrumbs
}) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Header State
  const isCompact = scrollY > 20;
  
  // Dynamic Theme Classes
  const isDark = theme === 'dark';
  
  const bgClass = isDark 
    ? "bg-[#050505] text-zinc-100" 
    : "bg-[#FAFAFA] text-zinc-900";

  const scrollToSection = (id: string) => {
    if (currentView !== 'landing') {
      onLogoClick?.();
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen font-sans relative overflow-x-hidden transition-colors duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${bgClass}`}>
      
      {/* ATMOSPHERE LAYERS */}
      
      {/* Light Mode Grid */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${isDark ? 'opacity-0' : 'opacity-100'}`}>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-white via-white/50 to-transparent"></div>
      </div>

      {/* Dark Mode Glow Orbs (Liquid Glass) */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${isDark ? 'opacity-100' : 'opacity-0'}`}>
         <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] bg-teal-900/20 animate-pulse"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full blur-[120px] bg-purple-900/20"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full">
        
        {/* HEADER */}
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 sm:pt-6 pointer-events-none px-4">
          <header 
            className={`pointer-events-auto grid grid-cols-[1fr_auto_1fr] items-center transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
              ${isCompact 
                ? `w-full max-w-4xl rounded-full px-6 py-3 border backdrop-blur-xl shadow-sm
                   ${isDark 
                     ? 'bg-[#0a0a0a]/80 border-white/10 shadow-black/50' 
                     : 'bg-white/80 border-black/5 shadow-black/5'}`
                : 'w-full max-w-7xl px-4 py-4 bg-transparent border-transparent'
              }
            `}
          >
            {/* LHS: Logo & Breadcrumbs */}
            <div className="flex items-center justify-start gap-4">
              <div 
                className={`flex items-center gap-3 cursor-pointer group`}
                onClick={onLogoClick}
              >
                <div className={`p-2 rounded-xl transition-all duration-300 
                  ${isDark 
                    ? 'bg-teal-500/10 border border-teal-500/20' 
                    : 'bg-zinc-100 border border-zinc-200'}`
                }>
                  <Terminal className={`w-5 h-5 transition-colors ${isDark ? 'text-teal-400' : 'text-zinc-900'}`} />
                </div>
                <div className="flex flex-col">
                  <h1 className={`text-lg font-bold tracking-tight leading-none font-sans transition-colors ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    VibeBench
                  </h1>
                </div>
              </div>

              {breadcrumbs && (
                <>
                  <div className={`h-6 w-px ${isDark ? 'bg-white/10' : 'bg-zinc-200'}`} />
                  <div className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-zinc-500'}`}>
                    {breadcrumbs}
                  </div>
                </>
              )}
            </div>

            {/* Middle: Nav Anchors */}
            <div className="flex justify-center">
              {currentView === 'landing' && !isCompact && (
                <nav className={`hidden md:flex items-center gap-6 text-sm font-medium transition-colors duration-500 ${isDark ? 'text-white/60' : 'text-zinc-500'}`}>
                  <button onClick={() => scrollToSection('problem')} className={`hover:text-teal-500 transition-colors`}>Mission</button>
                  <button onClick={() => scrollToSection('challenges')} className={`hover:text-teal-500 transition-colors`}>Challenges</button>
                  <button onClick={() => scrollToSection('cepe')} className={`hover:text-teal-500 transition-colors`}>Scoring</button>
                  <button onClick={() => scrollToSection('impact')} className={`hover:text-teal-500 transition-colors`}>Impact</button>
                  <button onClick={() => scrollToSection('leaderboard')} className={`hover:text-teal-500 transition-colors`}>Leaderboard</button>
                </nav>
              )}
            </div>

            {/* RHS: Actions */}
            <div className="flex items-center justify-end gap-4">
              {/* Arena Mode: Manual Button */}
              {currentView === 'arena' && (
                <button 
                  onClick={onOpenGuide}
                  className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 px-4 py-2 rounded-lg border
                    ${isDark 
                      ? 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20' 
                      : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
                    }
                  `}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Manual</span>
                </button>
              )}

              {/* Landing Mode: Enter Arena Button */}
              {currentView === 'landing' && (
                 <button 
                   onClick={onEnterArena}
                   className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-all duration-300 group
                     px-5 py-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95
                     ${isDark 
                        ? 'bg-teal-600 text-white hover:bg-teal-500 shadow-teal-500/20' 
                        : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-900/20'}
                   `}
                 >
                   <span>Enter Arena</span>
                   <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </button>
              )}
            </div>
          </header>
        </div>
        
        <main className="relative w-full">
          {children}
        </main>
      </div>
      
      {/* FieldGuide Modal - Only visible when isOpen is true */}
      <FieldGuide isOpen={isGuideOpen} onClose={onCloseGuide} />
    </div>
  );
};