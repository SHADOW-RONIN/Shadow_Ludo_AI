export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type PlayerType = 'human' | 'ai';

export type AIDifficulty = 'easy' | 'normal' | 'hard';

export type GameMode = 'ai' | 'local' | 'practice';

export type TokenStatus = 'yard' | 'track' | 'homeLane' | 'finished';

export interface Token {
  id: string; // e.g. "red-0", "blue-2"
  color: PlayerColor;
  index: number; // 0, 1, 2, 3
  status: TokenStatus;
  // stepCount represents logical progress from entry (0 to 56)
  // -1 if in yard
  // 0..50 on track (51 squares)
  // 51..55 in home lane (5 squares)
  // 56 finished at center
  stepCount: number;
  trackIndex: number; // 0..51 if status === 'track', else -1
  homeLaneIndex: number; // 0..4 if status === 'homeLane', else -1
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  type: PlayerType;
  difficulty?: AIDifficulty;
  tokens: Token[];
  hasWon: boolean;
  finishRank?: number; // 1st, 2nd, 3rd, 4th
  stats: {
    captures: number;
    tokensFinished: number;
    rollsCount: number;
    sixesRolled: number;
  };
}

export interface GameRules {
  entryOnSixOnly: boolean; // if true, only 6 enters; if false, 1 or 6
  bonusRollOnSix: boolean; // default true
  bonusRollOnCapture: boolean; // default true
  threeSixesPenalty: boolean; // default true: 3 consecutive sixes cancels turn
  exactFinishingRoll: boolean; // default true: must roll exact number to enter center
}

export type GamePhase =
  | 'menu'
  | 'setup'
  | 'waiting_for_roll'
  | 'rolling'
  | 'waiting_for_token'
  | 'moving'
  | 'ai_thinking'
  | 'paused'
  | 'game_over';

export interface MoveAction {
  tokenId: string;
  fromStep: number;
  toStep: number;
  capturedTokenId?: string;
  isEntry: boolean;
  isFinished: boolean;
  bonusTurnAwarded: boolean;
}

export interface GameState {
  id: string;
  mode: GameMode;
  rules: GameRules;
  players: Player[];
  activePlayerIndex: number;
  currentDiceValue: number | null;
  consecutiveSixesCount: number;
  phase: GamePhase;
  legalMoveTokenIds: string[];
  winner: Player | null;
  rankings: Player[];
  moveHistory: string[];
  lastActionDescription: string;
  startTime: number;
  endTime?: number;
  hintsEnabled: boolean;
}

export interface BoardCoordinate {
  x: number; // 0..14 on standard 15x15 board
  y: number; // 0..14
}

export interface GameSettings {
  soundEnabled: boolean;
  soundVolume: number;
  musicEnabled: boolean;
  animationSpeed: 'normal' | 'fast';
  hintsDefault: boolean;
}

export interface GameStats {
  gamesPlayed: number;
  humanWins: number;
  totalCaptures: number;
  favoriteColor: PlayerColor;
}
