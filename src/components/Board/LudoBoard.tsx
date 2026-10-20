import React, { useMemo } from 'react';
import { GameState, PlayerColor, Token } from '../../types/game';
import {
  COLOR_CONFIG,
  getTokenCoordinate,
} from '../../game/boardPath';
import { calculateDestination } from '../../game/rules';

interface LudoBoardProps {
  gameState: GameState;
  onTokenClick: (tokenId: string) => void;
  animatingTokenId: string | null;
  animatingCoords?: { x: number; y: number } | null;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
  gameState,
  onTokenClick,
  animatingTokenId,
  animatingCoords,
}) => {
  const activePlayer = gameState.players[gameState.activePlayerIndex];
  const isHumanTurn = activePlayer?.type === 'human';
  const isWaitingForToken = gameState.phase === 'waiting_for_token';

  // Gather all tokens across all active players
  const allTokens = useMemo(() => {
    return gameState.players.flatMap((p) => p.tokens);
  }, [gameState.players]);

  // Group tokens by their board coordinates to handle stacking offsets cleanly
  const tokensByCoord = useMemo(() => {
    const map = new Map<string, Token[]>();
    for (const token of allTokens) {
      if (token.status === 'finished') continue; // finished tokens rest in center
      const coord = getTokenCoordinate(token.color, token.index, token.stepCount);
      const key = `${Math.round(coord.x * 10) / 10},${Math.round(coord.y * 10) / 10}`;
      const list = map.get(key) || [];
      list.push(token);
      map.set(key, list);
    }
    return map;
  }, [allTokens]);

  // Compute destination hints for practice mode or selected tokens
  const destinationHighlights = useMemo(() => {
    if (!gameState.hintsEnabled || !isWaitingForToken || !gameState.currentDiceValue || !activePlayer) {
      return [];
    }
    const dests: { x: number; y: number; color: PlayerColor; tokenId: string }[] = [];
    for (const tokenId of gameState.legalMoveTokenIds) {
      const token = activePlayer.tokens.find((t) => t.id === tokenId);
      if (token) {
        const { newStepCount } = calculateDestination(
          token,
          gameState.currentDiceValue,
          gameState.rules
        );
        const destCoord = getTokenCoordinate(token.color, token.index, newStepCount);
        dests.push({
          x: destCoord.x * 100 + 50,
          y: destCoord.y * 100 + 50,
          color: token.color,
          tokenId: token.id,
        });
      }
    }
    return dests;
  }, [gameState, activePlayer, isWaitingForToken]);

  return (
    <div className="relative w-full max-w-[620px] aspect-square mx-auto select-none rounded-2xl p-1.5 sm:p-2 bg-gradient-to-b from-slate-900 via-slate-950 to-[#0b0f19] shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)]">
      <svg
        viewBox="0 0 1500 1500"
        className="w-full h-full rounded-xl overflow-hidden drop-shadow-2xl"
        style={{ shapeRendering: 'geometricPrecision' }}
      >
        <defs>
          {/* Subtle gradient filters & shadows */}
          <filter id="boardShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
          </filter>
          <filter id="tokenGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <radialGradient id="tokenHighlight" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="yardRedGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
          <linearGradient id="yardGreenGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="yardYellowGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#a16207" />
          </linearGradient>
          <linearGradient id="yardBlueGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
        </defs>

        {/* Board Outer Background Frame */}
        <rect width="1500" height="1500" fill="#1e2430" rx="20" />
        <rect x="6" y="6" width="1488" height="1488" fill="#181e28" rx="16" />

        {/* 1. TOP-LEFT YARD (RED) */}
        <g id="yard-red">
          <rect x="15" y="15" width="570" height="570" rx="24" fill="url(#yardRedGrad)" />
          {/* Inner yard disc */}
          <circle cx="300" cy="300" r="215" fill="#f87171" fillOpacity="0.35" />
          <circle cx="300" cy="300" r="165" fill="#ef4444" fillOpacity="0.8" />
          {/* 4 Yard token pockets - solid crisp white circles matching reference */}
          <circle cx="210" cy="210" r="50" fill="#ffffff" filter="url(#boardShadow)" />
          <circle cx="390" cy="210" r="50" fill="#ffffff" filter="url(#boardShadow)" />
          <circle cx="210" cy="390" r="50" fill="#ffffff" filter="url(#boardShadow)" />
          <circle cx="390" cy="390" r="50" fill="#ffffff" filter="url(#boardShadow)" />
        </g>

        {/* 2. TOP-RIGHT YARD (GREEN) */}
        <g id="yard-green">
          <rect x="915" y="15" width="570" height="570" rx="24" fill="url(#yardGreenGrad)" />
          <circle cx="1200" cy="300" r="215" fill="#4ade80" fillOpacity="0.35" />
          <circle cx="1200" cy="300" r="165" fill="#22c55e" fillOpacity="0.8" />
          <circle cx="1110" cy="210" r="50" fill="#ffffff" filter="url(#boardShadow)" />
          <circle cx="1290" cy="210" r="50" fill="#ffffff" filter="url(#boardShadow)" />
          <circle cx="1110" cy="390" r="50" fill="#ffffff" filter="url(#boardShadow)" />
          <circle cx="1290" cy="390" r="50" fill="#ffffff" filter="url(#boardShadow)" />
        </g>

        {/* 3. BOTTOM-LEFT YARD (BLUE) */}
        <g id="yard-blue">
          <rect x="15" y="915" width="570" height="570" rx="24" fill="url(#yardBlueGrad)" />
          <circle cx="300" cy="1200" r="215" fill="#38bdf8" fillOpacity="0.35" />
          <circle cx="300" cy="1200" r="165" fill="#0ea5e9" fillOpacity="0.8" />
          <circle cx="210" cy="1110" r="50" fill="#ffffff" filter="url(#boardShadow)" />
          <circle cx="390" cy="1110" r="50" fill="#ffffff" filter="url(#boardShadow)" />
          <circle cx="210" cy="1290" r="50" fill="#ffffff" filter="url(#boardShadow)" />
          <circle cx="390" cy="1290" r="50" fill="#ffffff" filter="url(#boardShadow)" />
        </g>

        {/* 4. BOTTOM-RIGHT YARD (YELLOW) */}
        <g id="yard-yellow">
          <rect x="915" y="915" width="570" height="570" rx="24" fill="url(#yardYellowGrad)" />
          <circle cx="1200" cy="1200" r="215" fill="#facc15" fillOpacity="0.35" />
          <circle cx="1200" cy="1200" r="165" fill="#eab308" fillOpacity="0.8" />
          <circle cx="1110" cy="1110" r="50" fill="#ffffff" filter="url(#boardShadow)" />
          <circle cx="1290" cy="1110" r="50" fill="#ffffff" filter="url(#boardShadow)" />
          <circle cx="1110" cy="1290" r="50" fill="#ffffff" filter="url(#boardShadow)" />
          <circle cx="1290" cy="1290" r="50" fill="#ffffff" filter="url(#boardShadow)" />
        </g>

        {/* 5. CENTER FINISHING TRIANGLES */}
        <g id="center-zone">
          <rect x="600" y="600" width="300" height="300" fill="#181e28" stroke="#334155" strokeWidth="3" />
          {/* Red triangle (left) */}
          <polygon points="600,600 750,750 600,900" fill="#ef4444" />
          {/* Green triangle (top) */}
          <polygon points="600,600 750,750 900,600" fill="#22c55e" />
          {/* Yellow triangle (right) */}
          <polygon points="900,600 750,750 900,900" fill="#eab308" />
          {/* Blue triangle (bottom) */}
          <polygon points="600,900 750,750 900,900" fill="#0ea5e9" />
          {/* Center decorative hub */}
          <circle cx="750" cy="750" r="28" fill="#0f172a" stroke="#475569" strokeWidth="4" />
          <circle cx="750" cy="750" r="14" fill="#38bdf8" />
        </g>

        {/* 6. TRACK CELLS & HOME LANES */}
        {renderGridCells()}

        {/* 7. DESTINATION HINTS */}
        {destinationHighlights.map((dest) => (
          <g key={`hint-${dest.tokenId}`} className="animate-pulse pointer-events-none">
            <circle
              cx={dest.x}
              cy={dest.y}
              r="40"
              fill={COLOR_CONFIG[dest.color].hex}
              fillOpacity="0.3"
              stroke={COLOR_CONFIG[dest.color].hex}
              strokeWidth="4"
              strokeDasharray="8 6"
            />
            <circle cx={dest.x} cy={dest.y} r="10" fill="#ffffff" />
          </g>
        ))}

        {/* 8. TOKENS */}
        {renderTokens()}

        {/* 9. FINISHED TOKENS CENTER MEDALS */}
        {renderFinishedTokensHub()}
      </svg>
    </div>
  );

  function renderGridCells() {
    const cells: React.ReactNode[] = [];

    // Helper to generate a cell with square styling
    const makeCell = (
      col: number,
      row: number,
      fill: string,
      stroke: string = '#2d3748',
      extraIcon?: 'star' | 'arrow-left' | 'arrow-right' | 'arrow-down' | 'arrow-up'
    ) => {
      const x = col * 100;
      const y = row * 100;
      const key = `cell-${col}-${row}`;

      return (
        <g key={key}>
          <rect
            x={x + 3}
            y={y + 3}
            width="94"
            height="94"
            rx="14"
            fill={fill}
            stroke={stroke}
            strokeWidth="2.5"
            className="transition-colors duration-200"
          />
          {extraIcon === 'star' && (
            <g transform={`translate(${x + 50}, ${y + 50})`}>
              {/* 8-pointed authentic safe star matching reference */}
              <polygon
                points="0,-26 4,-9 18,-18 9,-4 26,0 9,4 18,18 4,9 0,26 -4,9 -18,18 -9,4 -26,0 -9,-4 -18,-18 -4,-9"
                fill="#94a3b8"
                stroke="#64748b"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </g>
          )}
          {extraIcon === 'arrow-right' && (
            <path
              d={`M ${x + 28} ${y + 26} Q ${x + 30} ${y + 24} ${x + 36} ${y + 27} L ${x + 72} ${y + 47} Q ${x + 76} ${y + 50} ${x + 72} ${y + 53} L ${x + 36} ${y + 73} Q ${x + 30} ${y + 76} ${x + 28} ${y + 74} Z`}
              fill="#ef4444"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}
          {extraIcon === 'arrow-down' && (
            <path
              d={`M ${x + 26} ${y + 28} Q ${x + 24} ${y + 30} ${x + 27} ${y + 36} L ${x + 47} ${y + 72} Q ${x + 50} ${y + 76} ${x + 53} ${y + 72} L ${x + 73} ${y + 36} Q ${x + 76} ${y + 30} ${x + 74} ${y + 28} Z`}
              fill="#22c55e"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}
          {extraIcon === 'arrow-left' && (
            <path
              d={`M ${x + 72} ${y + 26} Q ${x + 70} ${y + 24} ${x + 64} ${y + 27} L ${x + 28} ${y + 47} Q ${x + 24} ${y + 50} ${x + 28} ${y + 53} L ${x + 64} ${y + 73} Q ${x + 70} ${y + 76} ${x + 72} ${y + 74} Z`}
              fill="#eab308"
              stroke="#eab308"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}
          {extraIcon === 'arrow-up' && (
            <path
              d={`M ${x + 26} ${y + 72} Q ${x + 24} ${y + 70} ${x + 27} ${y + 64} L ${x + 47} ${y + 28} Q ${x + 50} ${y + 24} ${x + 53} ${y + 28} L ${x + 73} ${y + 64} Q ${x + 76} ${y + 70} ${x + 74} ${y + 72} Z`}
              fill="#0ea5e9"
              stroke="#0ea5e9"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}
        </g>
      );
    };

    // Render Left Arm (rows 6, 7, 8; cols 0..5)
    for (let c = 0; c <= 5; c++) {
      // Row 6 (top track)
      const isRedStart = c === 1;
      cells.push(
        makeCell(
          c,
          6,
          isRedStart ? '#ef4444' : '#e2e8f0',
          isRedStart ? '#b91c1c' : '#cbd5e1'
        )
      );

      // Row 7 (middle: c=0 is entrance arrow, c=1..5 is red home lane)
      if (c === 0) {
        cells.push(makeCell(c, 7, '#e2e8f0', '#cbd5e1', 'arrow-right'));
      } else {
        cells.push(makeCell(c, 7, '#ef4444', '#b91c1c'));
      }

      // Row 8 (bottom track, c=2 is star)
      const isStar = c === 2;
      cells.push(
        makeCell(
          c,
          8,
          '#e2e8f0',
          '#cbd5e1',
          isStar ? 'star' : undefined
        )
      );
    }

    // Render Top Arm (cols 6, 7, 8; rows 0..5)
    for (let r = 0; r <= 5; r++) {
      // Col 6 (left track, r=2 is star)
      const isStar = r === 2;
      cells.push(
        makeCell(
          6,
          r,
          '#e2e8f0',
          '#cbd5e1',
          isStar ? 'star' : undefined
        )
      );

      // Col 7 (middle: r=0 is entrance arrow, r=1..5 is green home lane)
      if (r === 0) {
        cells.push(makeCell(7, r, '#e2e8f0', '#cbd5e1', 'arrow-down'));
      } else {
        cells.push(makeCell(7, r, '#22c55e', '#15803d'));
      }

      // Col 8 (right track, r=1 is Green Start)
      const isGreenStart = r === 1;
      cells.push(
        makeCell(
          8,
          r,
          isGreenStart ? '#22c55e' : '#e2e8f0',
          isGreenStart ? '#15803d' : '#cbd5e1'
        )
      );
    }

    // Render Right Arm (rows 6, 7, 8; cols 9..14)
    for (let c = 9; c <= 14; c++) {
      // Row 6 (top track, c=12 is star)
      const isStar = c === 12;
      cells.push(
        makeCell(
          c,
          6,
          '#e2e8f0',
          '#cbd5e1',
          isStar ? 'star' : undefined
        )
      );

      // Row 7 (middle: c=14 is entrance arrow, c=9..13 is yellow home lane)
      if (c === 14) {
        cells.push(makeCell(c, 7, '#e2e8f0', '#cbd5e1', 'arrow-left'));
      } else {
        cells.push(makeCell(c, 7, '#eab308', '#a16207'));
      }

      // Row 8 (bottom track, c=13 is Yellow Start)
      const isYellowStart = c === 13;
      cells.push(
        makeCell(
          c,
          8,
          isYellowStart ? '#eab308' : '#e2e8f0',
          isYellowStart ? '#a16207' : '#cbd5e1'
        )
      );
    }

    // Render Bottom Arm (cols 6, 7, 8; rows 9..14)
    for (let r = 9; r <= 14; r++) {
      // Col 6 (left track, r=13 is Blue Start)
      const isBlueStart = r === 13;
      cells.push(
        makeCell(
          6,
          r,
          isBlueStart ? '#0ea5e9' : '#e2e8f0',
          isBlueStart ? '#0369a1' : '#cbd5e1'
        )
      );

      // Col 7 (middle: r=14 is entrance arrow, r=9..13 is blue home lane)
      if (r === 14) {
        cells.push(makeCell(7, r, '#e2e8f0', '#cbd5e1', 'arrow-up'));
      } else {
        cells.push(makeCell(7, r, '#0ea5e9', '#0369a1'));
      }

      // Col 8 (right track, r=12 is Star Safe Square!)
      // Row 12 (3rd square from bottom edge) matches TRACK_COORDINATES[34] and reference board!
      const isStar = r === 12;
      cells.push(
        makeCell(
          8,
          r,
          '#e2e8f0',
          '#cbd5e1',
          isStar ? 'star' : undefined
        )
      );
    }

    return cells;
  }

  function renderTokens() {
    // Sort tokens so selectable tokens are always rendered on top of unselectable ones
    const sortedTokens = [...allTokens].sort((a, b) => {
      const aSelectable =
        isHumanTurn && isWaitingForToken && gameState.legalMoveTokenIds.includes(a.id);
      const bSelectable =
        isHumanTurn && isWaitingForToken && gameState.legalMoveTokenIds.includes(b.id);
      if (aSelectable && !bSelectable) return 1;
      if (!aSelectable && bSelectable) return -1;
      return 0;
    });

    return sortedTokens.map((token) => {
      if (token.status === 'finished') return null;

      const isSelectable =
        isHumanTurn &&
        isWaitingForToken &&
        gameState.legalMoveTokenIds.includes(token.id);

      // Base coordinate from board logic
      let baseCoord = getTokenCoordinate(token.color, token.index, token.stepCount);

      // If currently animating smooth hop
      if (animatingTokenId === token.id && animatingCoords) {
        baseCoord = animatingCoords;
      }

      // Check stacking at this cell to offset nicely
      const key = `${Math.round(baseCoord.x * 10) / 10},${Math.round(baseCoord.y * 10) / 10}`;
      const stacked = tokensByCoord.get(key) || [];
      const stackIndex = stacked.findIndex((t) => t.id === token.id);
      const totalStacked = stacked.length;

      let offsetX = 0;
      let offsetY = 0;
      let scale = 1;

      if (token.status !== 'yard' && totalStacked > 1) {
        scale = 0.78;
        if (totalStacked === 2) {
          offsetX = stackIndex === 0 ? -18 : 18;
          offsetY = stackIndex === 0 ? -18 : 18;
        } else if (totalStacked === 3) {
          const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
          offsetX = Math.cos(angles[stackIndex]) * 20;
          offsetY = Math.sin(angles[stackIndex]) * 20;
        } else {
          // 4 stacked
          const pos = [
            [-18, -18],
            [18, -18],
            [-18, 18],
            [18, 18],
          ];
          offsetX = pos[stackIndex % 4][0];
          offsetY = pos[stackIndex % 4][1];
        }
      }

      const cx = baseCoord.x * 100 + 50 + offsetX;
      const cy = baseCoord.y * 100 + 50 + offsetY;
      const cfg = COLOR_CONFIG[token.color];

      return (
        <g
          key={token.id}
          className={`transition-transform duration-200 ${
            isSelectable ? 'cursor-pointer hover:scale-110 active:scale-95' : ''
          }`}
          onClick={() => {
            if (isSelectable) {
              onTokenClick(token.id);
            }
          }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          {/* Active selection pulse aura */}
          {isSelectable && (
            <circle
              cx={cx}
              cy={cy}
              r={44 * scale}
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              className="animate-ping opacity-75 pointer-events-none"
            />
          )}

          {/* Token Drop Shadow */}
          <circle
            cx={cx}
            cy={cy + 5}
            r={34 * scale}
            fill="#000000"
            fillOpacity="0.45"
            filter="url(#boardShadow)"
          />

          {/* Outer Token Rim */}
          <circle
            cx={cx}
            cy={cy}
            r={34 * scale}
            fill={cfg.hexDark}
            stroke="#ffffff"
            strokeWidth={isSelectable ? '4' : '2'}
            strokeOpacity={isSelectable ? '1' : '0.8'}
          />

          {/* Token Body (Player Color) */}
          <circle cx={cx} cy={cy} r={28 * scale} fill={cfg.hex} />

          {/* Specular 3D Highlight */}
          <ellipse
            cx={cx - 7 * scale}
            cy={cy - 8 * scale}
            rx={14 * scale}
            ry={9 * scale}
            fill="url(#tokenHighlight)"
          />

          {/* Inner Accent Ring */}
          <circle
            cx={cx}
            cy={cy}
            r={16 * scale}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeOpacity="0.85"
          />

          {/* Token Number / Pip */}
          <text
            x={cx}
            y={cy + 4 * scale}
            textAnchor="middle"
            fill="#ffffff"
            fontSize={`${15 * scale}px`}
            fontWeight="bold"
            fontFamily="Outfit, sans-serif"
            className="pointer-events-none drop-shadow"
          >
            {token.index + 1}
          </text>
        </g>
      );
    });
  }

  function renderFinishedTokensHub() {
    return gameState.players.map((p) => {
      const finishedTokens = p.tokens.filter((t) => t.status === 'finished');
      if (finishedTokens.length === 0) return null;

      const cfg = COLOR_CONFIG[p.color];
      const target = cfg.centerTarget;
      const cx = target.x * 100;
      const cy = target.y * 100;

      return (
        <g key={`finished-${p.color}`} transform={`translate(${cx}, ${cy})`}>
          <circle r="22" fill="#0f172a" stroke={cfg.hex} strokeWidth="3" />
          <text
            y="5"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="14px"
            fontWeight="bold"
            fontFamily="Outfit, sans-serif"
          >
            {finishedTokens.length}/4
          </text>
        </g>
      );
    });
  }
};
