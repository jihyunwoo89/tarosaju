'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ChipSelector } from '@/components/ui/ChipSelector';
import { BirthTimePicker } from './BirthTimePicker';
import { useSession, type Profile } from '@/store/session';
import { FortuneRequestSchema } from '@/lib/schema';

export function ProfileForm() {
  const router = useRouter();
  const setProfile = useSession(s => s.setProfile);
  const initial = useSession(s => s.profile);

  const [name, setName] = useState(initial?.name ?? '');
  const [gender, setGender] = useState<Profile['gender'] | null>(initial?.gender ?? null);
  const [birthDate, setBirthDate] = useState(initial?.birthDate ?? '');
  const [hourBranch, setHourBranch] = useState<Profile['hourBranch'] | null>(initial?.hourBranch ?? null);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gender || !hourBranch) return;
    const candidate = { name, gender, birthDate, hourBranch };
    const result = FortuneRequestSchema.pick({
      name: true, gender: true, birthDate: true, hourBranch: true,
    }).safeParse(candidate);
    if (!result.success) {
      const flat: Partial<Record<keyof Profile, string>> = {};
      for (const issue of result.error.issues) {
        flat[issue.path[0] as keyof Profile] = issue.message;
      }
      setErrors(flat);
      return;
    }
    setProfile(result.data);
    router.push('/category' as Route);
  }

  const canSubmit = name.length > 0 && gender !== null && birthDate.length > 0 && hourBranch !== null;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 max-w-sm w-full mx-auto px-6">
      <Input
        label="이름"
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={20}
        autoComplete="name"
        error={errors.name}
      />
      <ChipSelector
        label="성별"
        columns={2}
        options={[{ value: '남', label: '남' }, { value: '여', label: '여' }]}
        value={gender}
        onChange={setGender}
      />
      <Input
        label="양력 생년월일"
        type="date"
        min="1900-01-01"
        max={today}
        value={birthDate}
        onChange={e => setBirthDate(e.target.value)}
        error={errors.birthDate}
      />
      <BirthTimePicker value={hourBranch} onChange={setHourBranch} />
      <Button type="submit" disabled={!canSubmit} className="mt-2">다음</Button>
    </form>
  );
}
