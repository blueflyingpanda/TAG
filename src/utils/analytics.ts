import { API_BASE } from './config';
import { getAuthHeader } from './oauth';

const ANON_ID_KEY = 'tag_anon_id';
const APP_VERSION = '0.0.0';

/** Random id kept in localStorage so the server can tie guest events together */
function getAnonId(): string {
  try {
    let id = localStorage.getItem(ANON_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANON_ID_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

function getPlatform(): string {
  return (window as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp?.initData
    ? 'telegram'
    : 'web';
}

/** Headers the API uses to attribute analytics events; sent with every API request */
export function getAnalyticsHeaders(): Record<string, string> {
  const anonId = getAnonId();
  return {
    ...(anonId && { 'X-Anon-Id': anonId }),
    'X-Platform': getPlatform(),
    'X-App-Version': APP_VERSION,
  };
}

/**
 * Report an event the server cannot see on its own. Fire and forget;
 * the server ignores it when COLLECT_ANALYTICS is off.
 */
export function trackEvent(name: 'theme_shared', props: Record<string, unknown> = {}): void {
  void fetch(`${API_BASE}/events/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAnalyticsHeaders(), ...getAuthHeader() },
    body: JSON.stringify({ name, props }),
    keepalive: true,
  }).catch(() => {});
}
