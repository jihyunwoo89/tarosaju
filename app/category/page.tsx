'use client';
import { useRouter } from 'next/navigation';
import { ScreenTopBar, ChapterHeading } from '@/components/shared/atoms';
import { CategoryGrid } from '@/components/form/CategoryGrid';
import { useRouteGuard } from '@/lib/use-route-guard';

export default function CategoryPage() {
  useRouteGuard(['profile']);
  const router = useRouter();
  return (
    <main style={{
      width: '100%', minHeight: '100dvh', background: 'var(--color-bg)',
      position: 'relative', paddingTop: 54,
    }}>
      <ScreenTopBar current={2} total={4} onBack={() => router.back()} />
      <ChapterHeading
        numeral="II."
        lines={['무엇을', '묻고 싶으신가요']}
        subtitle="네 가지 중 한 가지 운을 골라 주세요"
      />
      <CategoryGrid />
    </main>
  );
}
