import Link from 'next/link';
import type { Route } from 'next';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="font-display text-5xl leading-tight mb-4 tracking-tight">
        Tarosaju
      </h1>
      <p className="text-muted max-w-xs leading-relaxed mb-10">
        사주 명식과 타로 카드 3 장으로<br />오늘의 결을 읽어봅니다.
      </p>
      <Link href={'/profile' as Route}>
        <Button>운세 보기</Button>
      </Link>
    </main>
  );
}
