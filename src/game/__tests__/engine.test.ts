import {
  createInitialGameState,
  applyDiceRoll,
  executeMove,
  getLegalMoves,
  canTokenMove,
  calculateDestination,
  checkCapture,
  DEFAULT_RULES,
} from '../rules';
import { selectAIMove, evaluateMove } from '../ai';
import { isSafeTrackSquare, COLOR_CONFIG } from '../boardPath';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('--- RUNNING SHADOW LUDO AI ENGINE TESTS ---');

// Test 1: Initial Game State
{
  const state = createInitialGameState({
    mode: 'ai',
    playerCount: 4,
    humanColor: 'red',
    aiDifficulty: 'normal',
  });

  assert(state.players.length === 4, 'Should initialize 4 players');
  assert(state.activePlayerIndex === 0, 'First player should be active');
  assert(state.players[0].color === 'red', 'Human color is Red');
  assert(state.players[0].tokens.length === 4, 'Red has 4 tokens');
  assert(
    state.players[0].tokens.every((t) => t.status === 'yard' && t.stepCount === -1),
    'All initial tokens start in yard'
  );
  assert(state.phase === 'waiting_for_roll', 'Initial phase is waiting_for_roll');
}

// Test 2: Token Entry Rules (Roll of 6 vs non-6)
{
  const state = createInitialGameState({
    mode: 'ai',
    playerCount: 4,
    humanColor: 'red',
  });

  // Roll non-6 (e.g. 3) when all in yard
  const { hasLegalMoves: moves3 } = applyDiceRoll(state, 3);
  assert(!moves3, 'Roll of 3 cannot enter yard tokens with entryOnSixOnly=true');

  // Roll 6
  const { nextState: stateRolled6, hasLegalMoves: moves6 } = applyDiceRoll(state, 6);
  assert(moves6, 'Roll of 6 must allow entry from yard');
  assert(stateRolled6.legalMoveTokenIds.length === 4, 'All 4 yard tokens can enter on 6');

  // Execute entry
  const { nextState: stateEntered, action } = executeMove(stateRolled6, 'red-0');
  assert(action.isEntry, 'Action flagged as isEntry');
  assert(action.toStep === 0, 'Entered token lands at stepCount 0');
  const movedToken = stateEntered.players[0].tokens[0];
  assert(movedToken.status === 'track', 'Token status changes to track');
  assert(
    movedToken.trackIndex === COLOR_CONFIG['red'].startIndex,
    'Token lands on Red start track square'
  );
  assert(action.bonusTurnAwarded, 'Rolling 6 grants bonus roll');
  assert(
    stateEntered.activePlayerIndex === 0,
    'Active player keeps turn after rolling 6'
  );
}

// Test 3: Normal Movement and Track Steps
{
  const state = createInitialGameState({
    mode: 'ai',
    playerCount: 4,
    humanColor: 'red',
  });

  // Set token 0 at step 10
  state.players[0].tokens[0].status = 'track';
  state.players[0].tokens[0].stepCount = 10;
  state.players[0].tokens[0].trackIndex = (COLOR_CONFIG.red.startIndex + 10) % 52;

  const { nextState: rolled4 } = applyDiceRoll(state, 4);
  const { nextState: moved4, action } = executeMove(rolled4, 'red-0');

  assert(action.toStep === 14, 'Token advances from step 10 to 14 (+4)');
  assert(
    moved4.players[0].tokens[0].stepCount === 14,
    'Token state correctly updated to step 14'
  );
}

// Test 4: Capturing Opponent
{
  const state = createInitialGameState({
    mode: 'ai',
    playerCount: 4,
    humanColor: 'red',
  });

  // Place Green token at track index 5 (which is NOT a safe star)
  assert(!isSafeTrackSquare(5), 'Track index 5 is an unsafe square');
  state.players[1].tokens[0].status = 'track';
  state.players[1].tokens[0].stepCount = (5 - COLOR_CONFIG.green.startIndex + 52) % 52;
  state.players[1].tokens[0].trackIndex = 5;

  // Place Red token at step 3 (which corresponds to track index (0 + 3) = 3)
  state.players[0].tokens[0].status = 'track';
  state.players[0].tokens[0].stepCount = 3;
  state.players[0].tokens[0].trackIndex = 3;

  // Roll a 2 -> Red token lands on 5!
  const { nextState: rolled2 } = applyDiceRoll(state, 2);
  const { nextState: afterCapture, action } = executeMove(rolled2, 'red-0');

  assert(action.capturedTokenId === 'green-0', 'Capture correctly detected green-0');
  assert(
    afterCapture.players[1].tokens[0].status === 'yard',
    'Captured Green token returned to yard'
  );
  assert(
    afterCapture.players[1].tokens[0].stepCount === -1,
    'Captured Green token stepCount reset to -1'
  );
  assert(
    afterCapture.players[0].stats.captures === 1,
    'Red captures stat incremented to 1'
  );
  assert(action.bonusTurnAwarded, 'Capturing awards a bonus turn');
}

// Test 5: Safe Square Immunity
{
  const state = createInitialGameState({
    mode: 'ai',
    playerCount: 4,
    humanColor: 'red',
  });

  // Track index 8 is a safe star
  assert(isSafeTrackSquare(8), 'Track index 8 is a safe star square');

  // Place Green token on safe star 8
  state.players[1].tokens[0].status = 'track';
  state.players[1].tokens[0].stepCount = (8 - COLOR_CONFIG.green.startIndex + 52) % 52;
  state.players[1].tokens[0].trackIndex = 8;

  // Place Red token at step 6 (track index 6). Red rolls 2 -> lands on 8.
  state.players[0].tokens[0].status = 'track';
  state.players[0].tokens[0].stepCount = 6;
  state.players[0].tokens[0].trackIndex = 6;

  const { nextState: rolled2 } = applyDiceRoll(state, 2);
  const { nextState: afterMove, action } = executeMove(rolled2, 'red-0');

  assert(action.capturedTokenId === undefined, 'No capture on safe square');
  assert(
    afterMove.players[1].tokens[0].status === 'track',
    'Green token remains on safe track'
  );
}

// Test 6: Home Lane and Exact Finishing Roll
{
  const state = createInitialGameState({
    mode: 'ai',
    playerCount: 4,
    humanColor: 'red',
  });

  // Token is at step 54 (in home lane, 2 steps away from finish at 56)
  state.players[0].tokens[0].status = 'homeLane';
  state.players[0].tokens[0].stepCount = 54;
  state.players[0].tokens[0].homeLaneIndex = 3;

  // Roll 3 -> 54 + 3 = 57 > 56 -> Illegal under exactFinishingRoll
  const canMoveWith3 = canTokenMove(state.players[0].tokens[0], 3, state.rules);
  assert(!canMoveWith3, 'Cannot overshoot finish (54 + 3 > 56) when exact roll required');

  // Roll 2 -> 54 + 2 = 56 -> Finished!
  const canMoveWith2 = canTokenMove(state.players[0].tokens[0], 2, state.rules);
  assert(canMoveWith2, 'Exact roll of 2 reaches finish (54 + 2 = 56)');

  const { nextState: rolled2 } = applyDiceRoll(state, 2);
  const { nextState: finishedState, action } = executeMove(rolled2, 'red-0');

  assert(action.isFinished, 'Action flagged as isFinished');
  assert(action.toStep === 56, 'Target step is 56');
  assert(
    finishedState.players[0].tokens[0].status === 'finished',
    'Token status is finished'
  );
  assert(
    finishedState.players[0].stats.tokensFinished === 1,
    'Player finished token count is 1'
  );
}

// Test 7: Three Consecutive Sixes Penalty
{
  const state = createInitialGameState({
    mode: 'ai',
    playerCount: 4,
    humanColor: 'red',
  });

  state.players[0].tokens[0].status = 'track';
  state.players[0].tokens[0].stepCount = 10;
  state.players[0].tokens[0].trackIndex = 10;

  // First 6
  const roll1 = applyDiceRoll(state, 6);
  assert(!roll1.consecutiveSixPenalty, 'First 6 has no penalty');

  // Second 6
  const stateWith1Six = { ...roll1.nextState, phase: 'waiting_for_roll' as const };
  const roll2 = applyDiceRoll(stateWith1Six, 6);
  assert(!roll2.consecutiveSixPenalty, 'Second 6 has no penalty');

  // Third 6
  const stateWith2Sixes = { ...roll2.nextState, phase: 'waiting_for_roll' as const };
  const roll3 = applyDiceRoll(stateWith2Sixes, 6);
  assert(
    roll3.consecutiveSixPenalty,
    'Third consecutive 6 triggers turn penalty'
  );
  assert(
    roll3.nextState.activePlayerIndex === 1,
    'Turn automatically forfeits to player 1'
  );
}

// Test 8: AI Strategic Evaluation
{
  const state = createInitialGameState({
    mode: 'ai',
    playerCount: 4,
    humanColor: 'red',
    aiDifficulty: 'hard',
  });

  const aiPlayer = state.players[1]; // Green AI
  aiPlayer.tokens[0].status = 'track';
  aiPlayer.tokens[0].stepCount = 10;
  aiPlayer.tokens[0].trackIndex = (COLOR_CONFIG.green.startIndex + 10) % 52;

  // Place Red token right within capture range (e.g. 4 squares ahead)
  const destIndex = (aiPlayer.tokens[0].trackIndex + 4) % 52;
  state.players[0].tokens[0].status = 'track';
  state.players[0].tokens[0].trackIndex = destIndex;
  state.players[0].tokens[0].stepCount = 15;

  state.activePlayerIndex = 1;
  state.currentDiceValue = 4;

  const aiMove = selectAIMove(aiPlayer, state, 'hard');
  assert(aiMove !== null, 'AI selects a valid move');
  assert(aiMove?.tokenId === 'green-0', 'AI prioritizes capturing Red opponent');
}

console.log('🎉 ALL 8 CORE ENGINE TEST SUITES PASSED FLAWLESSLY!');
