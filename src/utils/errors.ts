import type { Translations } from '../i18n/translations';

/** Short, user-facing message for a failed request (fetch rejects with TypeError when offline) */
export function friendlyError(err: unknown, t: Translations): string {
  return err instanceof TypeError ? t.err_network : t.err_generic;
}
