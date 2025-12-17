import type { PaginatedThemes, Theme, ThemePayload } from '../types';
import { authenticatedFetch } from './oauth';

const API_BASE = 'http://localhost:8000';

/**
 * Get paginated list of themes
 */
export async function getThemes(
  page = 1,
  size = 50,
  language?: string,
  difficulty?: number,
  name?: string
): Promise<PaginatedThemes> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  if (language) params.append('language', language);
  if (difficulty) params.append('difficulty', difficulty.toString());
  if (name) params.append('name', name);

  const response = await fetch(`${API_BASE}/themes/?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch themes: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get theme details by ID
 */
export async function getTheme(themeId: number): Promise<Theme> {
  const response = await fetch(`${API_BASE}/themes/${themeId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Theme not found');
    }
    throw new Error(`Failed to fetch theme: ${response.statusText}`);
  }

  return response.json();
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

  return response.json();
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