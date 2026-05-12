'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useSession } from '@/store/session';
import { useFortune } from '@/lib/use-fortune';
import { LoadingState } from '@/components/result/LoadingState';
import { ErrorState } from '@/components/result/ErrorState';
import { ResultView } from '@/components/result/ResultView';
import { ScreenTopBar } from '@/components/shared/atoms';
import { useRouteGuard } from '@/lib/use-route-guard';

export default function ResultPage() {
  useRouteGuard(['profile', 'category', 'cards']);
  const router = useRouter();

  const profile = useSession(s => s.profile);
  const category = useSession(s => s.category);
  const cards = useSession(s => s.cards);
  const resetForReroll = useSession(s => s.resetForReroll);

  const canCall = !!profile && !!category && cards.length === 3;
  const input = useMemo(
    () => canCall ? { profile: profile!, category: category!, cards } : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canCall, profile, category, cards],
  );
  const { state, retry } = useFortune(input);

  if (state.status === 'loading' || !canCall) return <LoadingState />;
  if (state.status === 'error') {
    return <ErrorState code={state.code} retryable={state.retryable} onRetry={retry} />;
  }

  function onRestart() {
    resetForReroll();
    router.push('/' as Route);
  }

  return (
    <main style={{
      width: '100%', minHeight: '100dvh', background: 'var(--color-bg)',
      position: 'relative', paddingTop: 54,
    }}>
      <ScreenTopBar current={3} total={4} onBack={() => router.back()} />
      <ResultView
        profile={profile!}
        category={category!}
        pillars={state.pillars}
        fortune={state.fortune}
        picked={cards}
        onRestart={onRestart}
      />
    </main>
  );
}
