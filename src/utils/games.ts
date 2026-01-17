import type { GameCreatePayload, GameDetailsResponse, GameUpdatePayload, PaginatedGames } from '../types';
import { API_BASE } from './config';
import { authenticatedFetch } from './oauth';

/**
 * Get paginated list of games
 */
export async function getGames(
  page = 1,
  size = 50,
  themeId?: number,
  ended?: boolean,
  skipPenalty?: boolean,
  order?: string,
  descending?: boolean
): Promise<PaginatedGames> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (themeId) params.append('theme_id', themeId.toString());
  if (ended !== undefined) params.append('ended', ended.toString());
  if (skipPenalty !== undefined) params.append('skip_penalty', skipPenalty.toString());
  if (order) params.append('order', order);
  if (descending !== undefined) params.append('descending', descending.toString());

  const response = await authenticatedFetch(`${API_BASE}/games/?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get game details by ID
 */
export async function getGame(gameId: number): Promise<GameDetailsResponse> {
  const response = await authenticatedFetch(`${API_BASE}/games/${gameId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Game not found');
    }
    throw new Error(`Failed to fetch game: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new game
 */
export async function createGame(gameData: GameCreatePayload): Promise<GameDetailsResponse> {
  const response = await authenticatedFetch(`${API_BASE}/games/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gameData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create game: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update an existing game
 */
export async function updateGame(gameId: number, updateData: GameUpdatePayload): Promise<GameDetailsResponse> {
  const response = await authenticatedFetch(`${API_BASE}/games/${gameId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Game not found');
    }
    throw new Error(`Failed to update game: ${response.statusText}`);
  }

  return response.json();
}