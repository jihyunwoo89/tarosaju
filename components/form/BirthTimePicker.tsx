'use client';
import { ChipSelector } from '@/components/ui/ChipSelector';
import type { HourBranch } from '@/lib/saju';

const OPTIONS: { value: HourBranch; label: string; sub: string }[] = [
  { value: '자', label: '자', sub: '23–01' },
  { value: '축', label: '축', sub: '01–03' },
  { value: '인', label: '인', sub: '03–05' },
  { value: '묘', label: '묘', sub: '05–07' },
  { value: '진', label: '진', sub: '07–09' },
  { value: '사', label: '사', sub: '09–11' },
  { value: '오', label: '오', sub: '11–13' },
  { value: '미', label: '미', sub: '13–15' },
  { value: '신', label: '신', sub: '15–17' },
  { value: '유', label: '유', sub: '17–19' },
  { value: '술', label: '술', sub: '19–21' },
  { value: '해', label: '해', sub: '21–23' },
];

export function BirthTimePicker({ value, onChange }: { value: HourBranch | null; onChange: (v: HourBranch) => void }) {
  return <ChipSelector options={OPTIONS} value={value} onChange={onChange} label="태어난 시" columns={4} />;
}
