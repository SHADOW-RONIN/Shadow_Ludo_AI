import { BoardCoordinate, PlayerColor } from '../types/game';

// 52-square outer perimeter track on 15x15 board
export const TRACK_COORDINATES: BoardCoordinate[] = [
  /* 0 - Red start (safe) */ { x: 1, y: 6 },
  /* 1 */ { x: 2, y: 6 },
  /* 2 */ { x: 3, y: 6 },
  /* 3 */ { x: 4, y: 6 },
  /* 4 */ { x: 5, y: 6 },
  /* 5 */ { x: 6, y: 5 },
  /* 6 */ { x: 6, y: 4 },
  /* 7 */ { x: 6, y: 3 },
  /* 8 - Star (safe) */ { x: 6, y: 2 },
  /* 9 */ { x: 6, y: 1 },
  /* 10 */ { x: 6, y: 0 },
  /* 11 - Top turn */ { x: 7, y: 0 },
  /* 12 */ { x: 8, y: 0 },
  /* 13 - Green start (safe) */ { x: 8, y: 1 },
  /* 14 */ { x: 8, y: 2 },
  /* 15 */ { x: 8, y: 3 },
  /* 16 */ { x: 8, y: 4 },
  /* 17 */ { x: 8, y: 5 },
  /* 18 */ { x: 9, y: 6 },
  /* 19 */ { x: 10, y: 6 },
  /* 20 */ { x: 11, y: 6 },
  /* 21 - Star (safe) */ { x: 12, y: 6 },
  /* 22 */ { x: 13, y: 6 },
  /* 23 */ { x: 14, y: 6 },
  /* 24 - Right turn */ { x: 14, y: 7 },
  /* 25 */ { x: 14, y: 8 },
  /* 26 - Yellow start (safe) */ { x: 13, y: 8 },
  /* 27 */ { x: 12, y: 8 },
  /* 28 */ { x: 11, y: 8 },
  /* 29 */ { x: 10, y: 8 },
  /* 30 */ { x: 9, y: 8 },
  /* 31 */ { x: 8, y: 9 },
  /* 32 */ { x: 8, y: 10 },
  /* 33 */ { x: 8, y: 11 },
  /* 34 - Star (safe) */ { x: 8, y: 12 },
  /* 35 */ { x: 8, y: 13 },
  /* 36 */ { x: 8, y: 14 },
  /* 37 - Bottom turn */ { x: 7, y: 14 },
  /* 38 */ { x: 6, y: 14 },
  /* 39 - Blue start (safe) */ { x: 6, y: 13 },
  /* 40 */ { x: 6, y: 12 },
  /* 41 */ { x: 6, y: 11 },
  /* 42 */ { x: 6, y: 10 },
  /* 43 */ { x: 6, y: 9 },
  /* 44 */ { x: 5, y: 8 },
  /* 45 */ { x: 4, y: 8 },
  /* 46 */ { x: 3, y: 8 },
  /* 47 - Star (safe) */ { x: 2, y: 8 },
  /* 48 */ { x: 1, y: 8 },
  /* 49 */ { x: 0, y: 8 },
  /* 50 - Left turn */ { x: 0, y: 7 },
  /* 51 */ { x: 0, y: 6 },
];

export const SAFE_TRACK_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export const COLOR_CONFIG: Record<
  PlayerColor,
  {
    name: string;
    startIndex: number;
    hex: string;
    hexDark: string;
    hexGlow: string;
    bgBadge: string;
    borderBadge: string;
    textBadge: string;
    yardPositions: BoardCoordinate[];
    homeLane: BoardCoordinate[];
    centerTarget: BoardCoordinate;
  }
> = {
  red: {
    name: 'Crimson Red',
    startIndex: 0,
    hex: '#ef4444',
    hexDark: '#991b1b',
    hexGlow: 'rgba(239, 68, 68, 0.45)',
    bgBadge: 'bg-red-500/15',
    borderBadge: 'border-red-500/40',
    textBadge: 'text-red-400',
    yardPositions: [
      { x: 1.6, y: 1.6 },
      { x: 3.4, y: 1.6 },
      { x: 1.6, y: 3.4 },
      { x: 3.4, y: 3.4 },
    ],
    homeLane: [
      { x: 1, y: 7 },
      { x: 2, y: 7 },
      { x: 3, y: 7 },
      { x: 4, y: 7 },
      { x: 5, y: 7 },
    ],
    centerTarget: { x: 6.8, y: 7 },
  },
  green: {
    name: 'Emerald Green',
    startIndex: 13,
    hex: '#22c55e',
    hexDark: '#166534',
    hexGlow: 'rgba(34, 197, 94, 0.45)',
    bgBadge: 'bg-emerald-500/15',
    borderBadge: 'border-emerald-500/40',
    textBadge: 'text-emerald-400',
    yardPositions: [
      { x: 10.6, y: 1.6 },
      { x: 12.4, y: 1.6 },
      { x: 10.6, y: 3.4 },
      { x: 12.4, y: 3.4 },
    ],
    homeLane: [
      { x: 7, y: 1 },
      { x: 7, y: 2 },
      { x: 7, y: 3 },
      { x: 7, y: 4 },
      { x: 7, y: 5 },
    ],
    centerTarget: { x: 7, y: 6.8 },
  },
  yellow: {
    name: 'Solar Yellow',
    startIndex: 26,
    hex: '#eab308',
    hexDark: '#854d0e',
    hexGlow: 'rgba(234, 179, 8, 0.45)',
    bgBadge: 'bg-amber-500/15',
    borderBadge: 'border-amber-500/40',
    textBadge: 'text-amber-400',
    yardPositions: [
      { x: 10.6, y: 10.6 },
      { x: 12.4, y: 10.6 },
      { x: 10.6, y: 12.4 },
      { x: 12.4, y: 12.4 },
    ],
    homeLane: [
      { x: 13, y: 7 },
      { x: 12, y: 7 },
      { x: 11, y: 7 },
      { x: 10, y: 7 },
      { x: 9, y: 7 },
    ],
    centerTarget: { x: 7.2, y: 7 },
  },
  blue: {
    name: 'Cobalt Blue',
    startIndex: 39,
    hex: '#0ea5e9',
    hexDark: '#075985',
    hexGlow: 'rgba(14, 165, 233, 0.45)',
    bgBadge: 'bg-sky-500/15',
    borderBadge: 'border-sky-500/40',
    textBadge: 'text-sky-400',
    yardPositions: [
      { x: 1.6, y: 10.6 },
      { x: 3.4, y: 10.6 },
      { x: 1.6, y: 12.4 },
      { x: 3.4, y: 12.4 },
    ],
    homeLane: [
      { x: 7, y: 13 },
      { x: 7, y: 12 },
      { x: 7, y: 11 },
      { x: 7, y: 10 },
      { x: 7, y: 9 },
    ],
    centerTarget: { x: 7, y: 7.2 },
  },
};

/**
 * Get board coordinate for a token based on its logical stepCount and color
 */
export function getTokenCoordinate(
  color: PlayerColor,
  tokenIndex: number,
  stepCount: number
): BoardCoordinate {
  const cfg = COLOR_CONFIG[color];

  // Token is in yard
  if (stepCount < 0) {
    return cfg.yardPositions[tokenIndex] || { x: 0, y: 0 };
  }

  // Token is on perimeter track (stepCount 0..50)
  if (stepCount <= 50) {
    const trackIndex = (cfg.startIndex + stepCount) % 52;
    return TRACK_COORDINATES[trackIndex];
  }

  // Token is in home lane (stepCount 51..55)
  if (stepCount <= 55) {
    const laneIndex = stepCount - 51;
    return cfg.homeLane[laneIndex];
  }

  // Token has reached final center home (stepCount 56)
  return cfg.centerTarget;
}

/**
 * Convert stepCount to the actual track index (0..51) or -1 if in yard/home/finished
 */
export function getTrackIndex(color: PlayerColor, stepCount: number): number {
  if (stepCount < 0 || stepCount > 50) return -1;
  return (COLOR_CONFIG[color].startIndex + stepCount) % 52;
}

/**
 * Check if a given track index is a designated safe square
 */
export function isSafeTrackSquare(trackIndex: number): boolean {
  return SAFE_TRACK_INDICES.has(trackIndex);
}
