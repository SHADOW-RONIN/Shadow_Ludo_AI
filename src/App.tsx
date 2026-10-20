import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AIDifficulty,
  GameMode,
  GameRules,
  GameState,
  PlayerColor,
} from './types/game';
import {
  applyDiceRoll,
  createInitialGameState,
  executeMove,
  DEFAULT_RULES,
  calculateDestination,
} from './game/rules';
import { selectAIMove } from './game/ai';
import { getTokenCoordinate, isSafeTrackSquare } from './game/boardPath';
import { sound } from './utils/audio';
import {
  loadSettings,
  saveSettings,
  loadStats,
  recordGameFinished,
} from './utils/storage';

import { TitleScreen } from './components/TitleScreen';
import { GameSetupModal } from './components/GameSetupModal';
import { LudoBoard } from './components/Board/LudoBoard';
import { DiceComponent } from './components/Dice/DiceComponent';
import { PlayerCard } from './components/GameHUD/PlayerCard';
import { TurnBanner } from './components/GameHUD/TurnBanner';
import { PauseModal } from './components/Modals/PauseModal';
import { RulesModal } from './components/Modals/RulesModal';
import { VictoryModal } from './components/Modals/VictoryModal';

export default function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [stats, setStats] = useState(loadStats);

  // App screens: 'menu' | 'playing'
  const [screen, setScreen] = useState<'menu' | 'playing'>('menu');
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [setupMode, setSetupMode] = useState<GameMode>('ai');

  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState({
      mode: 'ai',
      playerCount: 4,
      humanColor: 'red',
      aiDifficulty: 'normal',
    })
  );

  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Smooth Token Hopping Animation State
  const [animatingTokenId, setAnimatingTokenId] = useState<string | null>(null);
  const [animatingCoords, setAnimatingCoords] = useState<{ x: number; y: number } | null>(null);

  // Active timers ref to clean up on unmount or reset
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  // Update volume & mute in sound manager
  useEffect(() => {
    sound.setMuted(!settings.soundEnabled);
    sound.setVolume(settings.soundVolume);
    saveSettings(settings);
  }, [settings]);

  // Handle Mute Toggle
  const handleToggleMute = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  }, []);

  // Handle Volume Change
  const handleVolumeChange = useCallback((vol: number) => {
    setSettings((prev) => ({
      ...prev,
      soundVolume: vol,
    }));
  }, []);

  // Start Game from Setup Modal
  const handleStartGame = useCallback(
    (config: {
      mode: GameMode;
      playerCount: 2 | 3 | 4;
      humanColor: PlayerColor;
      aiDifficulty: AIDifficulty;
      rules: GameRules;
      hintsEnabled: boolean;
    }) => {
      clearAllTimers();
      setIsSetupOpen(false);
      setIsPaused(false);
      const newGame = createInitialGameState(config);
      setGameState(newGame);
      setScreen('playing');
    },
    []
  );

  // Restart Current Match
  const handleRestart = useCallback(() => {
    clearAllTimers();
    setIsPaused(false);
    const activeHuman = gameState.players.find((p) => p.type === 'human');
    const newGame = createInitialGameState({
      mode: gameState.mode,
      playerCount: gameState.players.length as 2 | 3 | 4,
      humanColor: activeHuman ? activeHuman.color : 'red',
      rules: gameState.rules,
      hintsEnabled: gameState.hintsEnabled,
    });
    setGameState(newGame);
  }, [gameState]);

  // Execute Animate Move
  const animateAndExecuteMove = useCallback(
    (tokenId: string) => {
      if (animatingTokenId) return; // Prevent duplicate moves while animating

      const activePlayer = gameState.players[gameState.activePlayerIndex];
      const token = activePlayer?.tokens.find((t) => t.id === tokenId);
      const diceValue = gameState.currentDiceValue;

      if (!token || diceValue === null) return;

      const { newStepCount } = calculateDestination(token, diceValue, gameState.rules);
      const startStep = token.stepCount;

      // Token hops step by step
      setAnimatingTokenId(tokenId);

      const isEntry = token.status === 'yard';
      const stepsToAnimate: number[] = [];

      if (isEntry) {
        stepsToAnimate.push(0);
      } else {
        for (let s = startStep + 1; s <= newStepCount; s++) {
          stepsToAnimate.push(s);
        }
      }

      const stepDelay = settings.animationSpeed === 'fast' ? 55 : 95;
      let currentIdx = 0;

      const stepInterval = setInterval(() => {
        if (currentIdx < stepsToAnimate.length) {
          const currentStep = stepsToAnimate[currentIdx];
          const coord = getTokenCoordinate(token.color, token.index, currentStep);
          setAnimatingCoords(coord);
          sound.playTokenStep();
          currentIdx++;
        } else {
          clearInterval(stepInterval);
          setAnimatingTokenId(null);
          setAnimatingCoords(null);

          // Authoritative state update
          const { nextState, action } = executeMove(gameState, tokenId);

          // Audio triggers
          if (action.capturedTokenId) {
            sound.playCapture();
          } else if (action.isFinished) {
            sound.playHomeArrival();
          } else if (action.toStep <= 50 && isSafeTrackSquare(action.toStep)) {
            sound.playSafeChime();
          }

          // Record stats if match finished
          if (nextState.phase === 'game_over' && nextState.winner) {
            const humanPlayer = nextState.players.find((p) => p.type === 'human');
            const humanWon = humanPlayer?.id === nextState.winner.id;
            recordGameFinished(
              humanWon,
              humanPlayer?.stats.captures || 0,
              humanPlayer?.color || 'red'
            );
            setStats(loadStats());
          }

          setGameState(nextState);
        }
      }, stepDelay);
    },
    [animatingTokenId, gameState, settings.animationSpeed]
  );

  // Roll Dice Action
  const handleRollDice = useCallback(() => {
    if (
      isDiceRolling ||
      animatingTokenId ||
      gameState.phase !== 'waiting_for_roll' ||
      gameState.winner
    ) {
      return;
    }

    setIsDiceRolling(true);

    const timer = setTimeout(() => {
      const rolledValue = Math.floor(Math.random() * 6) + 1;
      setIsDiceRolling(false);

      const { nextState, hasLegalMoves } = applyDiceRoll(gameState, rolledValue);
      setGameState(nextState);

      // If human has only 1 legal move, we can automatically trigger it or wait for selection
      // Keeping it interactive so user sees the dice result clearly
    }, 600);

    timersRef.current.push(timer);
  }, [isDiceRolling, animatingTokenId, gameState]);

  // AI Turn Loop
  useEffect(() => {
    if (screen !== 'playing' || isPaused || isDiceRolling || animatingTokenId) {
      return;
    }

    const activePlayer = gameState.players[gameState.activePlayerIndex];
    if (!activePlayer || activePlayer.type !== 'ai' || gameState.winner) {
      return;
    }

    // AI is waiting to roll
    if (gameState.phase === 'waiting_for_roll') {
      const rollTimer = setTimeout(() => {
        sound.playDiceRoll();
        setIsDiceRolling(true);

        const resultTimer = setTimeout(() => {
          const rolledValue = Math.floor(Math.random() * 6) + 1;
          setIsDiceRolling(false);

          const { nextState, hasLegalMoves } = applyDiceRoll(gameState, rolledValue);
          setGameState(nextState);
        }, 550);

        timersRef.current.push(resultTimer);
      }, 650);

      timersRef.current.push(rollTimer);
      return;
    }

    // AI is waiting to select token
    if (gameState.phase === 'waiting_for_token') {
      const moveTimer = setTimeout(() => {
        const aiDecision = selectAIMove(activePlayer, gameState, activePlayer.difficulty);
        if (aiDecision) {
          animateAndExecuteMove(aiDecision.tokenId);
        }
      }, 700);

      timersRef.current.push(moveTimer);
    }
  }, [
    screen,
    gameState,
    isPaused,
    isDiceRolling,
    animatingTokenId,
    animateAndExecuteMove,
  ]);

  // Keyboard Shortcuts (Space/Enter to roll, Esc to pause, 1..4 for token choice)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'playing') return;

      if (e.key === 'Escape') {
        setIsPaused((prev) => !prev);
        return;
      }

      if (isPaused) return;

      const activePlayer = gameState.players[gameState.activePlayerIndex];
      const isHuman = activePlayer?.type === 'human';

      if ((e.key === ' ' || e.key === 'Enter') && isHuman) {
        if (gameState.phase === 'waiting_for_roll') {
          handleRollDice();
        } else if (
          gameState.phase === 'waiting_for_token' &&
          gameState.legalMoveTokenIds.length === 1
        ) {
          animateAndExecuteMove(gameState.legalMoveTokenIds[0]);
        }
      }

      // Quick number keys 1, 2, 3, 4 to pick token
      if (['1', '2', '3', '4'].includes(e.key) && isHuman && gameState.phase === 'waiting_for_token') {
        const tokenIndex = parseInt(e.key) - 1;
        const targetToken = activePlayer?.tokens[tokenIndex];
        if (targetToken && gameState.legalMoveTokenIds.includes(targetToken.id)) {
          animateAndExecuteMove(targetToken.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    screen,
    isPaused,
    gameState,
    handleRollDice,
    animateAndExecuteMove,
  ]);

  const activePlayer = gameState.players[gameState.activePlayerIndex];
  const isHumanTurn = activePlayer?.type === 'human';

  return (
    <div className="min-h-screen w-full bg-[#0b0f19] text-slate-100 flex flex-col justify-between font-sans selection:bg-cyan-500 selection:text-black">
      {screen === 'menu' ? (
        <TitleScreen
          onStartMode={(mode) => {
            setSetupMode(mode);
            setIsSetupOpen(true);
          }}
          onOpenRules={() => setIsRulesOpen(true)}
          stats={stats}
          isMuted={!settings.soundEnabled}
          onToggleMute={handleToggleMute}
        />
      ) : (
        /* Active Gameplay Shell */
        <div className="relative min-h-screen w-full flex flex-col justify-between p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
          {/* Top Turn Banner */}
          <TurnBanner
            gameState={gameState}
            onPause={() => setIsPaused(true)}
            onOpenRules={() => setIsRulesOpen(true)}
            onToggleHints={() =>
              setGameState((prev) => ({
                ...prev,
                hintsEnabled: !prev.hintsEnabled,
              }))
            }
            onRestart={handleRestart}
            isMuted={!settings.soundEnabled}
            onToggleMute={handleToggleMute}
          />

          {/* Main Game Stage */}
          <main className="flex-1 w-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 my-2 sm:my-4">
            {/* Left Player Cards (Players 0 & 3, e.g. Red & Blue) */}
            <div className="hidden lg:flex flex-col gap-3 w-56">
              {gameState.players[0] && (
                <PlayerCard
                  player={gameState.players[0]}
                  isActive={gameState.activePlayerIndex === 0}
                />
              )}
              {gameState.players[3] && (
                <PlayerCard
                  player={gameState.players[3]}
                  isActive={gameState.activePlayerIndex === 3}
                />
              )}
            </div>

            {/* Center Ludo Board */}
            <div className="flex-1 max-w-[580px] w-full flex flex-col items-center">
              <LudoBoard
                gameState={gameState}
                onTokenClick={(tokenId) => animateAndExecuteMove(tokenId)}
                animatingTokenId={animatingTokenId}
                animatingCoords={animatingCoords}
              />
            </div>

            {/* Right Player Cards & Dice Container */}
            <div className="w-full lg:w-60 flex flex-col items-center gap-4">
              {/* Right Player Cards on Large screen */}
              <div className="hidden lg:flex flex-col gap-3 w-full">
                {gameState.players[1] && (
                  <PlayerCard
                    player={gameState.players[1]}
                    isActive={gameState.activePlayerIndex === 1}
                  />
                )}
                {gameState.players[2] && (
                  <PlayerCard
                    player={gameState.players[2]}
                    isActive={gameState.activePlayerIndex === 2}
                  />
                )}
              </div>

              {/* Mobile / Tablet Horizontal Player Cards Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full lg:hidden">
                {gameState.players.map((p, idx) => (
                  <PlayerCard
                    key={p.id}
                    player={p}
                    isActive={gameState.activePlayerIndex === idx}
                    isCompact
                  />
                ))}
              </div>

              {/* Central Tactile Dice Box */}
              <div className="w-full p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl flex flex-col items-center">
                <DiceComponent
                  currentValue={gameState.currentDiceValue}
                  onRoll={handleRollDice}
                  disabled={
                    !isHumanTurn ||
                    gameState.phase !== 'waiting_for_roll' ||
                    Boolean(gameState.winner) ||
                    Boolean(animatingTokenId)
                  }
                  isRolling={isDiceRolling}
                  playerColor={activePlayer ? activePlayer.color : 'red'}
                  bonusTurn={gameState.consecutiveSixesCount > 0}
                  isAI={!isHumanTurn}
                />

                {/* Prompt instructions */}
                <div className="mt-3 text-center">
                  {gameState.phase === 'waiting_for_roll' && isHumanTurn && (
                    <span className="text-xs font-bold text-cyan-300 animate-pulse">
                      Tap Dice or Space to Roll!
                    </span>
                  )}
                  {gameState.phase === 'waiting_for_token' && isHumanTurn && (
                    <span className="text-xs font-bold text-amber-300 animate-pulse">
                      Select a highlighted piece to move
                    </span>
                  )}
                  {gameState.phase === 'waiting_for_roll' && !isHumanTurn && (
                    <span className="text-xs font-medium text-slate-400">
                      {activePlayer?.name} is rolling...
                    </span>
                  )}
                  {gameState.phase === 'waiting_for_token' && !isHumanTurn && (
                    <span className="text-xs font-medium text-slate-400">
                      {activePlayer?.name} is deciding move...
                    </span>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Bottom Control Hint Bar */}
          <footer className="w-full text-center py-1">
            <p className="text-[11px] font-mono text-slate-500 tracking-wider">
              Space/Click to Roll · Click Glowing Token to Move · Esc Pause
            </p>
          </footer>
        </div>
      )}

      {/* Setup Modal */}
      <GameSetupModal
        initialMode={setupMode}
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStartGame={handleStartGame}
      />

      {/* Pause Menu Modal */}
      <PauseModal
        isOpen={isPaused}
        onResume={() => setIsPaused(false)}
        onRestart={handleRestart}
        onMainMenu={() => {
          clearAllTimers();
          setIsPaused(false);
          setScreen('menu');
        }}
        onOpenRules={() => setIsRulesOpen(true)}
        isMuted={!settings.soundEnabled}
        onToggleMute={handleToggleMute}
        volume={settings.soundVolume}
        onVolumeChange={handleVolumeChange}
      />

      {/* Official Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Victory Modal */}
      {gameState.winner && (
        <VictoryModal
          gameState={gameState}
          winner={gameState.winner}
          onPlayAgain={handleRestart}
          onMainMenu={() => {
            clearAllTimers();
            setScreen('menu');
          }}
        />
      )}
    </div>
  );
}
