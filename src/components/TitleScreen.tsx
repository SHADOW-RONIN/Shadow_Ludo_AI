import React, { useEffect } from 'react';
import { GameMode, GameStats } from '../types/game';
import { sound } from '../utils/audio';
import {
  Bot,
  Users,
  GraduationCap,
  Sparkles,
  Trophy,
  Swords,
  BookOpen,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface TitleScreenProps {
  onStartMode: (mode: GameMode) => void;
  onOpenRules: () => void;
  stats: GameStats;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartMode,
  onOpenRules,
  stats,
  isMuted,
  onToggleMute,
}) => {
  // Listen for Space / Enter to quickly start default AI mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        sound.playButtonClick();
        onStartMode('ai');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartMode]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 bg-[#0b0f19] text-slate-100 overflow-hidden">
      {/* Background Ambient Glow & Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Top Utility Header */}
      <header className="relative z-10 w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs uppercase tracking-widest font-semibold text-cyan-400/90 font-mono">
            V1.0 • Offline Ready
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playButtonClick();
              onToggleMute();
            }}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              sound.playButtonClick();
              onOpenRules();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>How to Play</span>
          </button>
        </div>
      </header>

      {/* Hero Centerpiece & Title Lockup */}
      <main className="relative z-10 flex flex-col items-center text-center my-auto py-8 max-w-2xl">
        {/* Custom SVG Emblem Lockup */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 p-1 shadow-[0_0_50px_rgba(6,182,212,0.35)] flex items-center justify-center animate-pulse">
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center relative overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-16 h-16 sm:w-18 sm:h-18">
                {/* 4 Colored quadrants mini-emblem */}
                <rect x="15" y="15" width="30" height="30" rx="6" fill="#ef4444" />
                <rect x="55" y="15" width="30" height="30" rx="6" fill="#22c55e" />
                <rect x="15" y="55" width="30" height="30" rx="6" fill="#0ea5e9" />
                <rect x="55" y="55" width="30" height="30" rx="6" fill="#eab308" />
                {/* Center Star */}
                <polygon
                  points="50,38 53,46 62,47 55,53 57,62 50,57 43,62 45,53 38,47 47,46"
                  fill="#ffffff"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Title Lockup */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase mb-2">
          SHADOW <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">LUDO</span> AI
        </h1>
        <p className="text-slate-400 text-sm sm:text-base font-medium max-w-md mb-8">
          Roll the Dice. Outsmart the Board. Authentic classic rules paired with intelligent computer opponents.
        </p>

        {/* Mode Action Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {/* AI Mode */}
          <button
            onClick={() => {
              sound.playButtonClick();
              onStartMode('ai');
            }}
            className="group relative rounded-2xl p-4 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/60 shadow-lg hover:shadow-cyan-500/20 text-left transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Play vs AI</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                POPULAR
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Battle 1 to 3 smart AI bots across 3 difficulties.
            </p>
          </button>

          {/* Local Pass & Play */}
          <button
            onClick={() => {
              sound.playButtonClick();
              onStartMode('local');
            }}
            className="group relative rounded-2xl p-4 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-indigo-500/60 shadow-lg hover:shadow-indigo-500/20 text-left transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Pass & Play</h3>
            <p className="text-xs text-slate-400 mt-1">
              2 to 4 players on this same screen or device.
            </p>
          </button>

          {/* Practice Mode */}
          <button
            onClick={() => {
              sound.playButtonClick();
              onStartMode('practice');
            }}
            className="group relative rounded-2xl p-4 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/60 shadow-lg hover:shadow-emerald-500/20 text-left transition-all duration-300 hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Practice</h3>
            <p className="text-xs text-slate-400 mt-1">
              Learn rules with highlighted paths and tactical hints.
            </p>
          </button>
        </div>

        {/* Primary Start CTA */}
        <button
          onClick={() => {
            sound.playButtonClick();
            onStartMode('ai');
          }}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-slate-950 font-black text-sm tracking-wide uppercase hover:from-cyan-400 hover:to-indigo-500 shadow-xl shadow-cyan-500/25 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 mx-auto"
        >
          <Sparkles className="w-4 h-4 fill-current" />
          <span>Quick Play vs AI</span>
          <span className="text-xs opacity-75 font-mono ml-1">(Enter / Space)</span>
        </button>

        {/* Match Statistics Mini Pill */}
        {stats.gamesPlayed > 0 && (
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-400 bg-slate-900/60 px-4 py-2 rounded-full border border-slate-800">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{stats.humanWins} Wins</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-cyan-400" />
              <span>{stats.totalCaptures} Captures</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>{stats.gamesPlayed} Matches</span>
          </div>
        )}
      </main>

      {/* Flat Control Hints Footer */}
      <footer className="relative z-10 w-full text-center py-2">
        <p className="text-xs font-mono text-slate-500 tracking-wide">
          Click / Space to Roll · Click Token to Move · Esc Pause
        </p>
      </footer>
    </div>
  );
};
