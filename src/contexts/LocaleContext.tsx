import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type LocaleCode, type Translations, locales } from "../i18n/translations";

const STORAGE_KEY = "tag_locale";

function getInitialLocale(): LocaleCode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored in locales) return stored as LocaleCode;
  const browser = navigator.language.slice(0, 2);
  return browser in locales ? (browser as LocaleCode) : "en";
}

interface LocaleContextValue {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: Translations;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(getInitialLocale);

  const setLocale = useCallback((code: LocaleCode) => {
    localStorage.setItem(STORAGE_KEY, code);
    setLocaleState(code);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: locales[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
