'use client';
import { useEffect, useState, useCallback } from 'react';
import type { FortuneResponse } from '@/lib/schema';
import type { Pillars } from '@/lib/saju';
import type { Profile, Category, CardSelection } from '@/store/session';

export type FortuneState =
  | { status: 'loading' }
  | { status: 'success'; pillars: Pillars; fortune: FortuneResponse }
  | { status: 'error'; code: string; retryable: boolean; message?: string };

export type FortuneInput = {
  profile: Profile;
  category: Category;
  cards: CardSelection[];
};

export function useFortune(input: FortuneInput | null) {
  const [state, setState] = useState<FortuneState>({ status: 'loading' });
  const [nonce, setNonce] = useState(0);
  const retry = useCallback(() => setNonce(n => n + 1), []);

  useEffect(() => {
    if (!input) return;
    let cancelled = false;
    setState({ status: 'loading' });
    (async () => {
      try {
        const res = await fetch('/api/fortune', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            name: input.profile.name,
            gender: input.profile.gender,
            birthDate: input.profile.birthDate,
            hourBranch: input.profile.hourBranch,
            category: input.category,
            cards: input.cards,
          }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setState({ status: 'error', code: json.error ?? 'unknown', retryable: !!json.retryable, message: json.message });
          return;
        }
        setState({ status: 'success', pillars: json.pillars, fortune: json.fortune });
      } catch (e) {
        if (cancelled) return;
        setState({
          status: 'error',
          code: 'network_error',
          retryable: true,
          message: e instanceof Error ? e.message : String(e),
        });
      }
    })();
    return () => { cancelled = true; };
  }, [input, nonce]);

  return { state, retry };
}
