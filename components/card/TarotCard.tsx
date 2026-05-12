import Image from 'next/image';
import type { ArcanaCard } from '@/data/majorArcana';

export function TarotCard({
  card, reversed, width = 120,
}: { card: ArcanaCard; reversed: boolean; width?: number }) {
  return (
    <figure className="flex flex-col items-center gap-1">
      <Image
        src={`/cards/${card.id}.png`}
        alt={`${card.ko}${reversed ? ' 역방향' : ''}`}
        width={width}
        height={Math.round(width * 1.6)}
        unoptimized
        className={`select-none pointer-events-none rounded ${reversed ? 'rotate-180' : ''}`}
      />
      <figcaption className="font-display text-sm">
        {card.ko}{reversed && <span className="text-muted text-xs"> (역)</span>}
      </figcaption>
    </figure>
  );
}
