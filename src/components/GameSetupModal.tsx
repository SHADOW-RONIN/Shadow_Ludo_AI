import React, { useState } from 'react';
import { AIDifficulty, GameMode, GameRules, PlayerColor } from '../types/game';
import { COLOR_CONFIG } from '../game/boardPath';
import { DEFAULT_RULES } from '../game/rules';
import { sound } from '../utils/audio';
import { X, Play, Sliders, ShieldCheck } from 'lucide-react';

interface GameSetupModalProps {
  initialMode: GameMode;
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (config: {
    mode: GameMode;
    playerCount: 2 | 3 | 4;
    humanColor: PlayerColor;
    aiDifficulty: AIDifficulty;
    rules: GameRules;
    hintsEnabled: boolean;
  }) => void;
}

export const GameSetupModal: React.FC<GameSetupModalProps> = ({
  initialMode,
  isOpen,
  onClose,
  onStartGame,
}) => {
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);
  const [humanColor, setHumanColor] = useState<PlayerColor>('red');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('normal');
  const [rules, setRules] = useState<GameRules>(DEFAULT_RULES);
  const [showAdvancedRules, setShowAdvancedRules] = useState(false);

  if (!isOpen) return null;

  const handleStart = () => {
    sound.playButtonClick();
    onStartGame({
      mode,
      playerCount,
      humanColor,
      aiDifficulty,
      rules,
      hintsEnabled: mode === 'practice',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-black uppercase text-white">
              Game Setup
            </h2>
            <p className="text-xs text-slate-400">
              Customize your match settings and rules
            </p>
          </div>
          <button
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-5">
          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Game Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ai', 'local', 'practice'] as GameMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    sound.playButtonClick();
                    setMode(m);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    mode === m
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {m === 'ai' ? 'Vs AI' : m === 'local' ? 'Pass & Play' : 'Practice'}
                </button>
              ))}
            </div>
          </div>

          {/* Player Count */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Number of Players
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([2, 3, 4] as (2 | 3 | 4)[]).map((count) => (
                <button
                  key={count}
                  onClick={() => {
                    sound.playButtonClick();
                    setPlayerCount(count);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    playerCount === count
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {count} Players
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker (for human player) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {mode === 'local' ? 'Player 1 Starting Color' : 'Your Color'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((color) => {
                const cfg = COLOR_CONFIG[color];
                const isSelected = humanColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => {
                      sound.playButtonClick();
                      setHumanColor(color);
                    }}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-white bg-slate-800 ring-2 ring-white/30 scale-102'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full shadow"
                      style={{ backgroundColor: cfg.hex }}
                    />
                    <span className="capitalize text-[11px] text-slate-200">
                      {color}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Difficulty (if vs AI or Practice) */}
          {mode !== 'local' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                AI Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'normal', 'hard'] as AIDifficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      sound.playButtonClick();
                      setAiDifficulty(diff);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      aiDifficulty === diff
                        ? diff === 'easy'
                          ? 'bg-emerald-600 text-white'
                          : diff === 'normal'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-rose-600 text-white'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 italic">
                {aiDifficulty === 'easy' && 'Casual play, occasional mistakes, beginner-friendly.'}
                {aiDifficulty === 'normal' && 'Balanced strategy: prioritizes captures and safe moves.'}
                {aiDifficulty === 'hard' && 'Master level: analyzes danger, evades traps, aggressive.'}
              </p>
            </div>
          )}

          {/* Advanced Rules Accordion */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                sound.playButtonClick();
                setShowAdvancedRules(!showAdvancedRules);
              }}
              className="flex items-center justify-between w-full text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer py-1"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Custom Gameplay Rules</span>
              </span>
              <span>{showAdvancedRules ? '▲ Hide' : '▼ View'}</span>
            </button>

            {showAdvancedRules && (
              <div className="mt-3 space-y-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                {/* 6 to enter */}
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Require 6 to enter from yard</span>
                  <input
                    type="checkbox"
                    checked={rules.entryOnSixOnly}
                    onChange={(e) => setRules({ ...rules, entryOnSixOnly: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </label>

                {/* 3 Sixes Penalty */}
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Three consecutive 6s forfeits turn</span>
                  <input
                    type="checkbox"
                    checked={rules.threeSixesPenalty}
                    onChange={(e) => setRules({ ...rules, threeSixesPenalty: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </label>

                {/* Exact finishing roll */}
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Exact roll required to finish</span>
                  <input
                    type="checkbox"
                    checked={rules.exactFinishingRoll}
                    onChange={(e) => setRules({ ...rules, exactFinishingRoll: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </label>

                {/* Capture bonus */}
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-300">Capturing opponent grants extra roll</span>
                  <input
                    type="checkbox"
                    checked={rules.bonusRollOnCapture}
                    onChange={(e) => setRules({ ...rules, bonusRollOnCapture: e.target.checked })}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Start Match CTA */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              sound.playButtonClick();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs tracking-wider uppercase shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Match</span>
          </button>
        </div>
      </div>
    </div>
  );
};
