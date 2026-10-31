import type { GameCreatePayload, GameUpdatePayload } from '../types';
import { createGame, updateGame } from './games';

const LOCAL_GAMES_KEY = 'tag_local_games';
const CURRENT_GAME_ID_KEY = 'tag_current_game_id';

export const LOCAL_ID_PREFIX = 'local_game_';

interface LocalGame {
  localId: string;
  create: GameCreatePayload;
  update: GameUpdatePayload | null;
}

export const isLocalGameId = (id: string | null): id is string =>
  !!id && id.startsWith(LOCAL_ID_PREFIX);

const readAll = (): LocalGame[] => {
  try {
    const stored = localStorage.getItem(LOCAL_GAMES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const writeAll = (games: LocalGame[]): void => {
  localStorage.setItem(LOCAL_GAMES_KEY, JSON.stringify(games));
};

export const createLocalGame = (create: GameCreatePayload): string => {
  const localId = `${LOCAL_ID_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  writeAll([...readAll(), { localId, create, update: null }]);
  return localId;
};

export const updateLocalGame = (localId: string, update: GameUpdatePayload): void => {
  writeAll(readAll().map((g) => (g.localId === localId ? { ...g, update } : g)));
};

let syncing: Promise<Record<string, number>> | null = null;

/**
 * Upload locally stored games to the server and drop the ones that made it.
 * Returns a map of local id -> server id for the games that were synced.
 * Games that fail stay stored and are retried on the next call.
 */
export const syncLocalGames = (): Promise<Record<string, number>> => {
  syncing ??= (async () => {
    const synced: Record<string, number> = {};
    for (const game of readAll()) {
      try {
        const created = await createGame(game.create);
        if (game.update) await updateGame(created.id, game.update);
        synced[game.localId] = created.id;
        writeAll(readAll().filter((g) => g.localId !== game.localId));
      } catch (error) {
        console.error('Failed to sync local game:', error);
      }
    }
    const current = localStorage.getItem(CURRENT_GAME_ID_KEY);
    if (current && synced[current]) {
      localStorage.setItem(CURRENT_GAME_ID_KEY, String(synced[current]));
    }
    return synced;
  })().finally(() => {
    syncing = null;
  });
  return syncing;
};
