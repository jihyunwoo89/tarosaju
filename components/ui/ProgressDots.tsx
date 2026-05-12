export function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current}
         className="flex gap-1.5 justify-center my-3">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`h-1 w-6 rounded-full ${i + 1 <= current ? 'bg-accent' : 'bg-border'}`} />
      ))}
    </div>
  );
}
