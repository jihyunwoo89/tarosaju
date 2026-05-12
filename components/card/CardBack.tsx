import Image from 'next/image';

export function CardBack({ width = 120 }: { width?: number }) {
  return (
    <Image
      src="/cards/back.png"
      alt=""
      width={width}
      height={Math.round(width * 1.6)}
      priority={false}
      unoptimized
      aria-hidden="true"
      className="select-none pointer-events-none"
    />
  );
}
