'use client';
import { useMemo } from 'react';
import { useSession } from '@/store/session';
import { useFortune } from '@/lib/use-fortune';
import { LoadingState } from '@/components/result/LoadingState';
import { ErrorState } from '@/components/result/ErrorState';
import { FortuneRevealOrchestrator } from '@/components/result/FortuneRevealOrchestrator';
import { useRouteGuard } from '@/lib/use-route-guard';

export default function ResultPage() {
  useRouteGuard(['profile', 'category', 'cards']);

  const profile = useSession(s => s.profile);
  const category = useSession(s => s.category);
  const cards = useSession(s => s.cards);

  const canCall = !!profile && !!category && cards.length === 3;
  const input = useMemo(
    () => canCall ? { profile: profile!, category: category!, cards } : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canCall, profile, category, cards],
  );
  const { state, retry } = useFortune(input);

  // Guard redirects async; show loading briefly until navigation completes.
  if (state.status === 'loading' || !canCall) return <LoadingState />;
  if (state.status === 'error')    return <ErrorState code={state.code} retryable={state.retryable} onRetry={retry} />;
  return <FortuneRevealOrchestrator category={category!} pillars={state.pillars} cards={cards} fortune={state.fortune} />;
}
