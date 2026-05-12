'use client';
import { useMemo } from 'react';
import { useSession } from '@/store/session';
import { useFortune } from '@/lib/use-fortune';
import { LoadingState } from '@/components/result/LoadingState';
import { ErrorState } from '@/components/result/ErrorState';
import { FortuneRevealOrchestrator } from '@/components/result/FortuneRevealOrchestrator';

export default function ResultPage() {
  const profile = useSession(s => s.profile);
  const category = useSession(s => s.category);
  const cards = useSession(s => s.cards);

  // Task 20 의 가드 훅이 들어오기 전까지는 인라인으로 1차 가드.
  // (정식 가드는 Task 20 에서 도입)
  const canCall = !!profile && !!category && cards.length === 3;
  const input = useMemo(
    () => canCall ? { profile: profile!, category: category!, cards } : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canCall, profile, category, cards],
  );
  const { state, retry } = useFortune(input);

  if (!canCall) return <LoadingState />; // 곧 Task 20 의 가드가 가로챔
  if (state.status === 'loading')  return <LoadingState />;
  if (state.status === 'error')    return <ErrorState code={state.code} retryable={state.retryable} onRetry={retry} />;
  return <FortuneRevealOrchestrator category={category!} pillars={state.pillars} cards={cards} fortune={state.fortune} />;
}
