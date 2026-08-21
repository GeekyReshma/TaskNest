'use client';

import { useCallback, useEffect, useState } from 'react';
import * as api from '../utils/api';

export function useGuestSession() {
  const [guest, setGuest] = useState<api.GuestSession | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const restore = async () => {
      const token = api.getStoredToken();
      const stored = api.getStoredGuest();

      if (!token || !stored) {
        api.clearGuestSession();
        setIsChecking(false);
        return;
      }

      try {
        const me = await api.fetchMe();
        setGuest(me);
        api.persistGuestSession(token, me);
      } catch {
        api.clearGuestSession();
        setGuest(null);
      } finally {
        setIsChecking(false);
      }
    };

    void restore();
  }, []);

  const login = useCallback(async (name: string) => {
    setError(null);
    const session = await api.createGuestSession(name);
    api.persistGuestSession(session.accessToken, session.guest);
    setGuest(session.guest);
    return session.guest;
  }, []);

  const logout = useCallback(() => {
    api.clearGuestSession();
    setGuest(null);
  }, []);

  return { guest, isChecking, error, setError, login, logout };
}
