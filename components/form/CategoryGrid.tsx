'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { Button } from '@/components/ui/Button';
import { useSession, type Category } from '@/store/session';

const ITEMS: { value: Category; label: string; sub: string }[] = [
  { value: '연애', label: '연애운', sub: '관계의 다음 결' },
  { value: '금전', label: '금전운', sub: '돈의 흐름과 결단' },
  { value: '학업', label: '학업운', sub: '집중과 성취' },
  { value: '취업', label: '취업운', sub: '기회와 선택' },
];

export function CategoryGrid() {
  const router = useRouter();
  const initial = useSession(s => s.category);
  const setCategory = useSession(s => s.setCategory);
  const [selected, setSelected] = useState<Category | null>(initial);

  function go() {
    if (!selected) return;
    setCategory(selected);
    router.push('/draw' as Route);
  }

  return (
    <div className="flex flex-col gap-6 max-w-sm w-full mx-auto px-6">
      <ul className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="카테고리">
        {ITEMS.map(it => {
          const active = it.value === selected;
          return (
            <li key={it.value}>
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(it.value)}
                className={`w-full text-left rounded-md border p-4 transition min-h-[88px]
                  ${active ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:border-accent/40'}`}
              >
                <span className="font-display text-lg block">{it.label}</span>
                <span className="text-xs text-muted block mt-1">{it.sub}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Button disabled={!selected} onClick={go}>이 운세 보기</Button>
    </div>
  );
}
