import { ProgressDots } from '@/components/ui/ProgressDots';
import { CategoryGrid } from '@/components/form/CategoryGrid';

export default function CategoryPage() {
  return (
    <main className="min-h-[100dvh] py-10">
      <ProgressDots current={2} total={3} />
      <h1 className="font-display text-3xl text-center mb-8">어떤 운세를 볼까요?</h1>
      <CategoryGrid />
    </main>
  );
}
