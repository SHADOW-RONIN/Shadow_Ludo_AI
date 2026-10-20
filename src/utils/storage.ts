import { GameSettings, GameStats, PlayerColor } from '../types/game';

const SETTINGS_KEY = 'shadow_ludo_settings';
const STATS_KEY = 'shadow_ludo_stats';

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  soundVolume: 0.6,
  musicEnabled: false,
  animationSpeed: 'normal',
  hintsDefault: false,
};

export const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  humanWins: 0,
  totalCaptures: 0,
  favoriteColor: 'red',
};

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

export function loadStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function recordGameFinished(
  humanWon: boolean,
  captures: number,
  color: PlayerColor
): void {
  try {
    const stats = loadStats();
    stats.gamesPlayed += 1;
    if (humanWon) stats.humanWins += 1;
    stats.totalCaptures += captures;
    stats.favoriteColor = color;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}
