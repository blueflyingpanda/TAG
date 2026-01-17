/**
 * OAuth utilities for handling Google OAuth callback
 * Backend flow:
 * 1. FE -> POST /login -> BE handles OAuth, redirects to FE with ?code=<one-time-code>
 * 2. FE exchanges code with /exchange -> gets {"token": <jwt>}
 * 3. Store token in localStorage, use in Authorization: Bearer <token>
 * 4. If token expired, logout automatically
 */

import type { User } from '../types';
import { AUTH_ENDPOINTS } from './config';

const TOKEN_STORAGE_KEY = 'auth_token';

/**
 * JWT payload structure
 */
interface JWTPayload {
  user_id: number;
  email: string;
  picture?: string;
  admin: boolean;
  exp: number;
  iat: number;
}

/**
 * Initiate OAuth login flow
 * POST to backend /login endpoint which handles Google OAuth
 */
export function initiateOAuthLogin(): void {
  // Use a form POST to avoid CORS issues with redirects
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = AUTH_ENDPOINTS.login;
  document.body.appendChild(form);
  form.submit();
}

/**
 * Exchange OAuth code for JWT token
 */
export async function exchangeOAuthCode(code: string): Promise<string> {
  const response = await fetch(AUTH_ENDPOINTS.exchange, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error(`OAuth exchange failed: ${response.statusText}`);
  }

  const data = await response.json();
  const token = data.token;

  // Store token in localStorage
  localStorage.setItem(TOKEN_STORAGE_KEY, token);

  return token;
}

/**
 * Get stored JWT token
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Decode JWT token to get payload (client-side decoding for UI purposes)
 */
function decodeJWT(token: string): JWTPayload | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload)) as JWTPayload;
    return decoded;
  } catch (err) {
    console.error('Failed to decode JWT:', err);
    return null;
  }
}

/**
 * Get current user from stored token
 */
export function getCurrentUser(): User | null {
  const token = getStoredToken();
  if (!token) return null;

  const payload = decodeJWT(token);
  if (!payload) return null;

  // Check if token is expired
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    // Token expired, clear it
    clearStoredToken();
    return null;
  }

  return {
    id: payload.user_id.toString(),
    email: payload.email,
    username: payload.email.split('@')[0], // Use email prefix as username
    picture: payload.picture,
    admin: payload.admin,
  };
}

/**
 * Clear stored token (logout)
 */
export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Get authorization header for API requests
 */
export function getAuthHeader(): { Authorization: string } | Record<string, never> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Make authenticated API request with Bearer token
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const authHeader = getAuthHeader();
  const headers = {
    ...options.headers,
    ...authHeader,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Clear OAuth redirect from URL after processing
 */
export function clearOAuthCallback(): void {
  window.history.replaceState({}, document.title, window.location.pathname);
}