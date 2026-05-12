'use client';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { CardDeck } from '@/components/card/CardDeck';
import { Button } from '@/components/ui/Button';
import { useSession } from '@/store/session';
import { useState } from 'react';
import type { DrawnCard } from '@/lib/tarot';

export default function DrawPage() {
  const router = useRouter();
  const setCards = useSession(s => s.setCards);
  const [done, setDone] = useState<DrawnCard[] | null>(null);

  function onComplete(drawn: DrawnCard[]) {
    setDone(drawn);
  }

  function goResult() {
    if (!done) return;
    setCards(done.map(d => ({ id: d.card.id, reversed: d.reversed })));
    router.push('/result' as Route);
  }

  return (
    <main className="min-h-[100dvh] py-6 flex flex-col">
      <ProgressDots current={3} total={3} />
      <h1 className="font-display text-2xl text-center mb-2">카드를 뽑아 주세요</h1>
      <p className="text-center text-xs text-muted mb-4">1번째 — 과거 · 2번째 — 현재 · 3번째 — 미래</p>
      <CardDeck onComplete={onComplete} />
      <div className="px-6 mt-auto pb-8">
        <Button onClick={goResult} disabled={!done} className="w-full">운세 보기</Button>
      </div>
    </main>
  );
}
