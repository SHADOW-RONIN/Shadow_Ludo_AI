import React from 'react';
import { Player } from '../../types/game';
import { COLOR_CONFIG } from '../../game/boardPath';
import { Bot, User, Trophy, ShieldAlert } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  isCompact?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isActive,
  isCompact = false,
}) => {
  const cfg = COLOR_CONFIG[player.color];
  const finishedCount = player.tokens.filter((t) => t.status === 'finished').length;
  const inHomeLaneCount = player.tokens.filter((t) => t.status === 'homeLane').length;
  const onTrackCount = player.tokens.filter((t) => t.status === 'track').length;
  const inYardCount = player.tokens.filter((t) => t.status === 'yard').length;

  return (
    <div
      className={`relative rounded-xl p-3 transition-all duration-300 ${
        isActive
          ? 'bg-slate-900/90 border-2 shadow-lg ring-2 ring-white/10 scale-102'
          : 'bg-slate-950/60 border border-slate-800/80 opacity-80 hover:opacity-100'
      }`}
      style={{
        borderColor: isActive ? cfg.hex : undefined,
        boxShadow: isActive ? `0 4px 20px ${cfg.hexGlow}` : undefined,
      }}
    >
      {/* Player Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow"
            style={{ backgroundColor: cfg.hex }}
          >
            {player.type === 'human' ? (
              <User className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>
          <div className="truncate">
            <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate flex items-center gap-1.5">
              <span>{player.name}</span>
              {player.hasWon && (
                <span className="text-amber-400">
                  <Trophy className="w-3.5 h-3.5 inline" />
                </span>
              )}
            </h4>
            <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              {player.type === 'human' ? 'Human' : `${player.difficulty || 'Normal'} AI`}
            </div>
          </div>
        </div>

        {/* Finished tokens count badge */}
        <div className="shrink-0 flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700/60 text-xs font-bold tabular-nums">
          <span style={{ color: cfg.hex }}>{finishedCount}</span>
          <span className="text-slate-500">/4</span>
        </div>
      </div>

      {/* Token state progress dots */}
      {!isCompact && (
        <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-800/60 text-[10px]">
          <div className="flex flex-col items-center py-0.5 rounded bg-slate-900/50">
            <span className="text-slate-400">Yard</span>
            <span className="font-bold text-slate-200">{inYardCount}</span>
          </div>
          <div className="flex flex-col items-center py-0.5 rounded bg-slate-900/50">
            <span className="text-slate-400">Track</span>
            <span className="font-bold text-slate-200">{onTrackCount}</span>
          </div>
          <div className="flex flex-col items-center py-0.5 rounded bg-slate-900/50">
            <span className="text-slate-400">Lane</span>
            <span className="font-bold text-slate-200">{inHomeLaneCount}</span>
          </div>
          <div className="flex flex-col items-center py-0.5 rounded bg-slate-900/50">
            <span className="text-slate-400">Home</span>
            <span className="font-bold text-emerald-400">{finishedCount}</span>
          </div>
        </div>
      )}

      {/* Extra stats: Captures */}
      {player.stats.captures > 0 && !isCompact && (
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-400 font-medium">
          <ShieldAlert className="w-3 h-3" />
          <span>{player.stats.captures} capture{player.stats.captures > 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
};
