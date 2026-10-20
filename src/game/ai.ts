import { AIDifficulty, GameState, Player, Token } from '../types/game';
import {
  calculateDestination,
  checkCapture,
  getLegalMoves,
} from './rules';
import { isSafeTrackSquare } from './boardPath';

interface MoveScore {
  tokenId: string;
  score: number;
  reason: string;
}

/**
 * Check if a token on the track is currently threatened by any opponent within 1..6 steps behind
 */
function isTokenThreatened(token: Token, state: GameState): boolean {
  if (token.status !== 'track' || isSafeTrackSquare(token.trackIndex)) {
    return false;
  }

  for (const player of state.players) {
    if (player.color === token.color) continue;
    for (const opponentToken of player.tokens) {
      if (opponentToken.status === 'track') {
        // Distance on 52-square loop
        const distance = (token.trackIndex - opponentToken.trackIndex + 52) % 52;
        if (distance >= 1 && distance <= 6) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Check if a landing track index would be vulnerable to any opponent within 1..6 steps behind
 */
function isDestinationVulnerable(
  destTrackIndex: number,
  myColor: string,
  state: GameState
): boolean {
  if (destTrackIndex < 0 || isSafeTrackSquare(destTrackIndex)) {
    return false;
  }

  for (const player of state.players) {
    if (player.color === myColor) continue;
    for (const opp of player.tokens) {
      if (opp.status === 'track') {
        const distance = (destTrackIndex - opp.trackIndex + 52) % 52;
        if (distance >= 1 && distance <= 6) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Evaluate and score a candidate move for a token
 */
export function evaluateMove(
  token: Token,
  state: GameState,
  difficulty: AIDifficulty
): MoveScore {
  const diceValue = state.currentDiceValue!;
  const { newStepCount, newStatus, newTrackIndex } = calculateDestination(
    token,
    diceValue,
    state.rules
  );

  let score = 0;
  const reasons: string[] = [];

  // 1. Reaching home (Finishing)
  if (newStatus === 'finished') {
    score += 1000;
    reasons.push('reaches home');
  }

  // 2. Entering home lane (100% safe zone)
  if (newStatus === 'homeLane' && token.status === 'track') {
    score += 250;
    reasons.push('enters safe home lane');
  }

  // 3. Capturing an opponent
  if (newStatus === 'track') {
    const captured = checkCapture(token.color, newTrackIndex, state.players);
    if (captured) {
      // Capturing opponent who is advanced is worth more
      const captureValue = 400 + captured.stepCount * 5;
      score += captureValue;
      reasons.push(`captures ${captured.color}`);
    }
  }

  // 4. Moving to a designated safe square (Star or Start)
  if (newStatus === 'track' && isSafeTrackSquare(newTrackIndex)) {
    score += 180;
    reasons.push('lands on safe square');
  }

  // 5. Entering yard token onto the track
  if (token.status === 'yard') {
    score += 200;
    reasons.push('enters new piece');
  }

  // 6. Escaping current danger
  if (difficulty !== 'easy') {
    const currentlyThreatened = isTokenThreatened(token, state);
    if (currentlyThreatened) {
      score += 150;
      reasons.push('escapes danger');
    }

    // Danger penalty if landing on an unsafe square within opponent striking distance
    if (isDestinationVulnerable(newTrackIndex, token.color, state)) {
      score -= difficulty === 'hard' ? 180 : 80;
      reasons.push('risks capture');
    }
  }

  // 7. General forward progress
  score += newStepCount * 2;

  // Add small random jitter based on difficulty
  if (difficulty === 'easy') {
    // Easy AI has high randomness
    score += Math.random() * 300 - 100;
  } else if (difficulty === 'normal') {
    score += Math.random() * 40 - 20;
  } else {
    // Hard AI is very consistent and strategic
    score += Math.random() * 5;
  }

  return {
    tokenId: token.id,
    score,
    reason: reasons.join(', ') || 'advances position',
  };
}

/**
 * Select the optimal legal move for an AI player
 */
export function selectAIMove(
  aiPlayer: Player,
  state: GameState,
  difficulty: AIDifficulty = 'normal'
): { tokenId: string; reason: string } | null {
  const legalTokenIds = getLegalMoves(aiPlayer, state.currentDiceValue!, state.rules);

  if (legalTokenIds.length === 0) {
    return null;
  }

  if (legalTokenIds.length === 1) {
    return { tokenId: legalTokenIds[0], reason: 'only legal move' };
  }

  const candidateTokens = aiPlayer.tokens.filter((t) => legalTokenIds.includes(t.id));

  const scoredMoves: MoveScore[] = candidateTokens.map((token) =>
    evaluateMove(token, state, difficulty)
  );

  // Sort descending by score
  scoredMoves.sort((a, b) => b.score - a.score);

  return {
    tokenId: scoredMoves[0].tokenId,
    reason: scoredMoves[0].reason,
  };
}
