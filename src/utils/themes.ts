import type { PaginatedThemes, Theme, ThemePayload } from '../types';
import { API_BASE } from './config';
import { authenticatedFetch } from './oauth';

/**
 * Get paginated list of themes
 */
export async function getThemes(
  page = 1,
  size = 50,
  language?: string,
  difficulty?: number,
  name?: string,
  mine?: boolean,
  verified?: boolean,
  favourites?: boolean,
  order?: string,
  descending?: boolean
): Promise<PaginatedThemes> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (language) params.append('language', language);
  if (difficulty) params.append('difficulty', difficulty.toString());
  if (name) params.append('name', name);
  if (mine !== undefined) params.append('mine', mine.toString());
  if (verified !== undefined) params.append('verified', verified.toString());
  if (favourites !== undefined) params.append('favourites', favourites.toString());
  if (order) params.append('order', order);
  if (descending !== undefined) params.append('descending', descending.toString());

  const response = await authenticatedFetch(`${API_BASE}/themes/?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch themes: ${response.statusText}`);
  }

  const data = await response.json();

  // Transform API response to match our interface
  return {
    ...data,
    items: data.items.map((item: any) => ({
      ...item,
      likes_count: item.likes,
    })),
  };
}

/**
 * Get theme details by ID
 */
export async function getTheme(themeId: number): Promise<Theme> {
  const response = await authenticatedFetch(`${API_BASE}/themes/${themeId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Theme not found');
    }
    throw new Error(`Failed to fetch theme: ${response.statusText}`);
  }

  const data = await response.json();

  // Transform API response to match our interface
  return {
    ...data,
    likes_count: data.likes,
    is_favorited: data.favourite,
  };
}

/**
 * Create a new theme
 */
export async function createTheme(themeData: ThemePayload): Promise<Theme> {
  const response = await authenticatedFetch(`${API_BASE}/themes/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(themeData),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Theme with this name already exists');
    }
    throw new Error(`Failed to create theme: ${response.statusText}`);
  }

  const data = await response.json();

  // Transform API response to match our interface
  return {
    ...data,
    likes_count: data.likes,
    is_favorited: data.favourite,
  };
}

/**
 * Add theme to favorites
 */
export async function addThemeToFavorites(themeId: number): Promise<void> {
  const response = await authenticatedFetch(`${API_BASE}/themes/${themeId}/favourite`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Failed to add theme to favorites: ${response.statusText}`);
  }
}

/**
 * Remove theme from favorites
 */
export async function removeThemeFromFavorites(themeId: number): Promise<void> {
  const response = await authenticatedFetch(`${API_BASE}/themes/${themeId}/favourite`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to remove theme from favorites: ${response.statusText}`);
  }
}

/**
 * Convert API theme to local theme format for backward compatibility
 */
export function apiThemeToLocal(theme: Theme): {
  lang: string;
  name: string;
  teams: string[];
  words: string[];
} {
  return {
    lang: theme.language,
    name: theme.name,
    teams: theme.description.teams,
    words: theme.description.words,
  };
}

/**
 * Convert local theme format to API theme payload
 */
export function localThemeToApi(
  theme: { lang: string; name: string; teams: string[]; words: string[] },
  difficulty = 1
): ThemePayload {
  return {
    name: theme.name,
    language: theme.lang,
    difficulty,
    description: {
      words: theme.words,
      teams: theme.teams,
    },
  };
}