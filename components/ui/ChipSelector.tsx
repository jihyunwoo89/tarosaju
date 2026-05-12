'use client';

type ChipOption<V extends string> = { value: V; label: string; sub?: string };

type Props<V extends string> = {
  options: ChipOption<V>[];
  value: V | null;
  onChange: (v: V) => void;
  label: string;
  columns?: 2 | 3 | 4 | 6;
};

export function ChipSelector<V extends string>({ options, value, onChange, label, columns = 4 }: Props<V>) {
  const grid = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4', 6: 'grid-cols-6' }[columns];
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-xs uppercase tracking-wider text-muted">{label}</legend>
      <div className={`grid ${grid} gap-2`}>
        {options.map(o => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              aria-pressed={active}
              className={`min-h-11 rounded-full border px-3 text-sm transition
                ${active ? 'border-accent bg-accent text-bg' : 'border-border bg-surface text-text hover:border-accent/40'}`}
            >
              <span className="font-medium">{o.label}</span>
              {o.sub && <span className={`block text-[10px] mt-0.5 ${active ? 'text-bg/80' : 'text-muted'}`}>{o.sub}</span>}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
