import {
  GameMode,
  GamePhase,
  GameRules,
  GameState,
  MoveAction,
  Player,
  PlayerColor,
  Token,
} from '../types/game';
import {
  COLOR_CONFIG,
  getTrackIndex,
  isSafeTrackSquare,
} from './boardPath';

export const DEFAULT_RULES: GameRules = {
  entryOnSixOnly: true,
  bonusRollOnSix: true,
  bonusRollOnCapture: true,
  threeSixesPenalty: true,
  exactFinishingRoll: true,
};

export const COLOR_ORDER: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

/**
 * Initialize 4 tokens for a given player color
 */
export function createPlayerTokens(color: PlayerColor): Token[] {
  return [0, 1, 2, 3].map((index) => ({
    id: `${color}-${index}`,
    color,
    index,
    status: 'yard',
    stepCount: -1,
    trackIndex: -1,
    homeLaneIndex: -1,
  }));
}

/**
 * Create a new authoritative GameState
 */
export function createInitialGameState(config: {
  mode: GameMode;
  playerCount: 2 | 3 | 4;
  humanColor?: PlayerColor;
  aiDifficulty?: 'easy' | 'normal' | 'hard';
  rules?: Partial<GameRules>;
  hintsEnabled?: boolean;
}): GameState {
  const rules: GameRules = { ...DEFAULT_RULES, ...(config.rules || {}) };
  const humanColor = config.humanColor || 'red';

  // Determine active colors based on count
  let selectedColors: PlayerColor[];
  if (config.playerCount === 2) {
    // Standard 2-player Ludo: Opposite corners (Red vs Yellow, or Blue vs Green)
    selectedColors = humanColor === 'red' || humanColor === 'yellow' ? ['red', 'yellow'] : ['green', 'blue'];
    if (!selectedColors.includes(humanColor)) {
      selectedColors = [humanColor, humanColor === 'red' ? 'yellow' : humanColor === 'green' ? 'blue' : humanColor === 'yellow' ? 'red' : 'green'];
    }
  } else if (config.playerCount === 3) {
    selectedColors = ['red', 'green', 'yellow'];
    if (!selectedColors.includes(humanColor)) {
      selectedColors = [humanColor, 'green', 'yellow'];
    }
  } else {
    selectedColors = ['red', 'green', 'yellow', 'blue'];
  }

  // Ensure human is first or appropriate order
  const players: Player[] = selectedColors.map((color) => {
    const isHuman = config.mode === 'local' ? true : color === humanColor;
    return {
      id: `player-${color}`,
      name: isHuman
        ? config.mode === 'local'
          ? `${COLOR_CONFIG[color].name.split(' ')[0]} Player`
          : 'You'
        : `Shadow AI (${color.toUpperCase()})`,
      color,
      type: isHuman ? 'human' : 'ai',
      difficulty: isHuman ? undefined : config.aiDifficulty || 'normal',
      tokens: createPlayerTokens(color),
      hasWon: false,
      stats: {
        captures: 0,
        tokensFinished: 0,
        rollsCount: 0,
        sixesRolled: 0,
      },
    };
  });

  return {
    id: `game-${Date.now()}`,
    mode: config.mode,
    rules,
    players,
    activePlayerIndex: 0,
    currentDiceValue: null,
    consecutiveSixesCount: 0,
    phase: 'waiting_for_roll',
    legalMoveTokenIds: [],
    winner: null,
    rankings: [],
    moveHistory: ['Game initialized. Roll the dice to begin!'],
    lastActionDescription: 'Game ready. Roll the dice!',
    startTime: Date.now(),
    hintsEnabled: config.hintsEnabled ?? (config.mode === 'practice'),
  };
}

/**
 * Determine if a specific token can legally move given the current dice value
 */
export function canTokenMove(
  token: Token,
  diceValue: number,
  rules: GameRules
): boolean {
  if (token.status === 'finished') {
    return false;
  }

  // Yard token
  if (token.status === 'yard') {
    if (rules.entryOnSixOnly) {
      return diceValue === 6;
    }
    return diceValue === 6 || diceValue === 1;
  }

  // Token on track or homeLane
  const nextStep = token.stepCount + diceValue;

  if (rules.exactFinishingRoll) {
    return nextStep <= 56;
  }
  return true;
}

/**
 * Get all legal token IDs for the active player
 */
export function getLegalMoves(
  player: Player,
  diceValue: number,
  rules: GameRules
): string[] {
  if (player.hasWon) return [];
  return player.tokens
    .filter((token) => canTokenMove(token, diceValue, rules))
    .map((t) => t.id);
}

/**
 * Calculates new stepCount and token status after move
 */
export function calculateDestination(
  token: Token,
  diceValue: number,
  rules: GameRules
): {
  newStepCount: number;
  newStatus: Token['status'];
  newTrackIndex: number;
  newHomeLaneIndex: number;
} {
  if (token.status === 'yard') {
    const newStepCount = 0;
    const newTrackIndex = COLOR_CONFIG[token.color].startIndex;
    return {
      newStepCount,
      newStatus: 'track',
      newTrackIndex,
      newHomeLaneIndex: -1,
    };
  }

  let newStepCount = token.stepCount + diceValue;
  if (!rules.exactFinishingRoll && newStepCount > 56) {
    newStepCount = 56;
  }

  if (newStepCount === 56) {
    return {
      newStepCount: 56,
      newStatus: 'finished',
      newTrackIndex: -1,
      newHomeLaneIndex: -1,
    };
  }

  if (newStepCount >= 51) {
    return {
      newStepCount,
      newStatus: 'homeLane',
      newTrackIndex: -1,
      newHomeLaneIndex: newStepCount - 51,
    };
  }

  return {
    newStepCount,
    newStatus: 'track',
    newTrackIndex: getTrackIndex(token.color, newStepCount),
    newHomeLaneIndex: -1,
  };
}

/**
 * Check if the landing square captures any opponent tokens.
 * Returns the captured token ID if applicable.
 */
export function checkCapture(
  movingColor: PlayerColor,
  destTrackIndex: number,
  players: Player[]
): Token | null {
  if (destTrackIndex < 0 || isSafeTrackSquare(destTrackIndex)) {
    return null;
  }

  for (const player of players) {
    if (player.color === movingColor) continue;
    for (const token of player.tokens) {
      if (token.status === 'track' && token.trackIndex === destTrackIndex) {
        return token;
      }
    }
  }

  return null;
}

/**
 * Pure state reducer to execute a token move and advance or award bonus turn
 */
export function executeMove(
  state: GameState,
  tokenId: string
): { nextState: GameState; action: MoveAction } {
  const activePlayer = state.players[state.activePlayerIndex];
  const token = activePlayer.tokens.find((t) => t.id === tokenId);
  const diceValue = state.currentDiceValue;

  if (!token || diceValue === null) {
    throw new Error(`Invalid move attempt: token ${tokenId} or null dice`);
  }

  const fromStep = token.stepCount;
  const isEntry = token.status === 'yard';

  const { newStepCount, newStatus, newTrackIndex, newHomeLaneIndex } =
    calculateDestination(token, diceValue, state.rules);

  const isFinished = newStatus === 'finished';

  // Check captures
  let capturedToken: Token | null = null;
  if (newStatus === 'track' && !isSafeTrackSquare(newTrackIndex)) {
    capturedToken = checkCapture(activePlayer.color, newTrackIndex, state.players);
  }

  // Create deep copy of players
  const nextPlayers: Player[] = state.players.map((p) => {
    if (p.id === activePlayer.id) {
      const updatedTokens = p.tokens.map((t) => {
        if (t.id === tokenId) {
          return {
            ...t,
            status: newStatus,
            stepCount: newStepCount,
            trackIndex: newTrackIndex,
            homeLaneIndex: newHomeLaneIndex,
          };
        }
        return t;
      });

      const finishedCount = updatedTokens.filter((t) => t.status === 'finished').length;
      const playerWon = finishedCount === 4;

      return {
        ...p,
        tokens: updatedTokens,
        hasWon: playerWon,
        stats: {
          ...p.stats,
          captures: p.stats.captures + (capturedToken ? 1 : 0),
          tokensFinished: finishedCount,
        },
      };
    }

    if (capturedToken && p.color === capturedToken.color) {
      const updatedTokens = p.tokens.map((t) => {
        if (t.id === capturedToken!.id) {
          return {
            ...t,
            status: 'yard' as const,
            stepCount: -1,
            trackIndex: -1,
            homeLaneIndex: -1,
          };
        }
        return t;
      });
      return {
        ...p,
        tokens: updatedTokens,
      };
    }

    return p;
  });

  const currentUpdatedPlayer = nextPlayers[state.activePlayerIndex];
  const hasWonThisTurn = currentUpdatedPlayer.hasWon && !activePlayer.hasWon;

  // Rankings update
  const nextRankings = [...state.rankings];
  if (hasWonThisTurn) {
    currentUpdatedPlayer.finishRank = nextRankings.length + 1;
    nextRankings.push(currentUpdatedPlayer);
  }

  // Bonus turn logic
  const isSix = diceValue === 6;
  const rolledBonus = isSix && state.rules.bonusRollOnSix;
  const captureBonus = Boolean(capturedToken) && state.rules.bonusRollOnCapture;
  const bonusAwarded = !currentUpdatedPlayer.hasWon && (rolledBonus || captureBonus);

  let nextPhase: GamePhase = 'waiting_for_roll';
  let nextWinner = state.winner;
  let nextActiveIndex = state.activePlayerIndex;

  // Check overall game victory
  if (!state.winner && currentUpdatedPlayer.hasWon) {
    nextWinner = currentUpdatedPlayer;
  }

  // In casual play, if 1st place wins, game ends
  const activeUnfinishedCount = nextPlayers.filter((p) => !p.hasWon).length;
  if (nextWinner && (activeUnfinishedCount <= 1 || state.mode !== 'local')) {
    nextPhase = 'game_over';
  } else if (!bonusAwarded) {
    // Advance to next active player
    nextActiveIndex = getNextActivePlayerIndex(nextPlayers, state.activePlayerIndex);
  }

  // Build descriptive log
  let description = `${activePlayer.name} moved piece`;
  if (isEntry) {
    description = `${activePlayer.name} entered a piece onto the board!`;
  } else if (isFinished) {
    description = `${activePlayer.name} reached HOME! (${currentUpdatedPlayer.stats.tokensFinished}/4)`;
  } else if (capturedToken) {
    description = `${activePlayer.name} CAPTURED ${capturedToken.color.toUpperCase()}! Extra turn granted!`;
  } else if (bonusAwarded && isSix) {
    description = `${activePlayer.name} rolled a 6! Rolls again!`;
  }

  const nextState: GameState = {
    ...state,
    players: nextPlayers,
    activePlayerIndex: nextActiveIndex,
    currentDiceValue: null,
    consecutiveSixesCount: bonusAwarded && isSix ? state.consecutiveSixesCount : 0,
    phase: nextPhase,
    legalMoveTokenIds: [],
    winner: nextWinner,
    rankings: nextRankings,
    moveHistory: [description, ...state.moveHistory].slice(0, 30),
    lastActionDescription: description,
    endTime: nextPhase === 'game_over' ? Date.now() : state.endTime,
  };

  const action: MoveAction = {
    tokenId,
    fromStep,
    toStep: newStepCount,
    capturedTokenId: capturedToken?.id,
    isEntry,
    isFinished,
    bonusTurnAwarded: bonusAwarded,
  };

  return { nextState, action };
}

/**
 * Advance turn to next player that has not yet won
 */
export function getNextActivePlayerIndex(
  players: Player[],
  currentIndex: number
): number {
  let next = (currentIndex + 1) % players.length;
  let loops = 0;
  while (players[next].hasWon && loops < players.length) {
    next = (next + 1) % players.length;
    loops++;
  }
  return next;
}

/**
 * Handle dice roll event and evaluate legal moves or consecutive sixes
 */
export function applyDiceRoll(
  state: GameState,
  diceValue: number
): {
  nextState: GameState;
  hasLegalMoves: boolean;
  consecutiveSixPenalty: boolean;
} {
  const activePlayer = state.players[state.activePlayerIndex];

  // Update roll stats
  const nextPlayers = state.players.map((p, idx) => {
    if (idx === state.activePlayerIndex) {
      return {
        ...p,
        stats: {
          ...p.stats,
          rollsCount: p.stats.rollsCount + 1,
          sixesRolled: p.stats.sixesRolled + (diceValue === 6 ? 1 : 0),
        },
      };
    }
    return p;
  });

  const nextSixCount = diceValue === 6 ? state.consecutiveSixesCount + 1 : 0;

  // 3 Consecutive Sixes Penalty check
  if (state.rules.threeSixesPenalty && nextSixCount >= 3) {
    const penaltyMsg = `${activePlayer.name} rolled three consecutive 6s! Turn forfeited!`;
    const nextIndex = getNextActivePlayerIndex(nextPlayers, state.activePlayerIndex);
    return {
      nextState: {
        ...state,
        players: nextPlayers,
        currentDiceValue: diceValue,
        consecutiveSixesCount: 0,
        activePlayerIndex: nextIndex,
        phase: 'waiting_for_roll',
        legalMoveTokenIds: [],
        lastActionDescription: penaltyMsg,
        moveHistory: [penaltyMsg, ...state.moveHistory].slice(0, 30),
      },
      hasLegalMoves: false,
      consecutiveSixPenalty: true,
    };
  }

  const legalMoves = getLegalMoves(activePlayer, diceValue, state.rules);

  if (legalMoves.length === 0) {
    const noMoveMsg = `${activePlayer.name} rolled ${diceValue} (no legal moves).`;
    const nextIndex = getNextActivePlayerIndex(nextPlayers, state.activePlayerIndex);

    return {
      nextState: {
        ...state,
        players: nextPlayers,
        currentDiceValue: diceValue,
        consecutiveSixesCount: 0,
        activePlayerIndex: nextIndex,
        phase: 'waiting_for_roll',
        legalMoveTokenIds: [],
        lastActionDescription: noMoveMsg,
        moveHistory: [noMoveMsg, ...state.moveHistory].slice(0, 30),
      },
      hasLegalMoves: false,
      consecutiveSixPenalty: false,
    };
  }

  return {
    nextState: {
      ...state,
      players: nextPlayers,
      currentDiceValue: diceValue,
      consecutiveSixesCount: nextSixCount,
      phase: 'waiting_for_token',
      legalMoveTokenIds: legalMoves,
      lastActionDescription: `${activePlayer.name} rolled ${diceValue}! Select a piece to move.`,
    },
    hasLegalMoves: true,
    consecutiveSixPenalty: false,
  };
}
