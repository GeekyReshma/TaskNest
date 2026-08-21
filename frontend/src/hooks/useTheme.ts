'use client';

import { useCallback, useEffect, useState } from 'react';

const THEME_KEY = 'tasknest_theme';

export function useTheme() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setIsDarkTheme(dark);
    document.documentElement.classList.toggle('dark', dark);
    setReady(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkTheme((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
      return next;
    });
  }, []);

  return { isDarkTheme, toggleTheme, ready };
}
