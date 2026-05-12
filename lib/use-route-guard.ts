'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/store/session';
import { toast } from '@/components/ui/Toast';

type Requirement = 'profile' | 'category' | 'cards';

export function useRouteGuard(required: Requirement[]) {
  const router = useRouter();
  const profile = useSession(s => s.profile);
  const category = useSession(s => s.category);
  const cards = useSession(s => s.cards);

  // Use JSON.stringify(required) as dep to avoid re-firing on every render
  // when callers pass an inline array literal (new reference each render).
  useEffect(() => {
    const missing =
      (required.includes('profile') && !profile) ||
      (required.includes('category') && !category) ||
      (required.includes('cards') && cards.length !== 3);

    if (missing) {
      toast('이전 단계를 먼저 완료해 주세요.');
      router.replace('/profile');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(required), profile, category, cards, router]);
}
