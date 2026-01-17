/**
 * API Configuration
 * Automatically detects environment based on hostname
 */

const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE = isDevelopment
  ? 'http://localhost:8000'
  : 'https://tag-api.servegame.com';

export const AUTH_ENDPOINTS = {
  login: `${API_BASE}/auth/login`,
  exchange: `${API_BASE}/auth/exchange`,
};
