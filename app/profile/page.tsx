'use client';
import { useRouter } from 'next/navigation';
import { ScreenTopBar, ChapterHeading } from '@/components/shared/atoms';
import { ProfileForm } from '@/components/form/ProfileForm';

export default function ProfilePage() {
  const router = useRouter();
  return (
    <main style={{
      width: '100%', minHeight: '100dvh', background: 'var(--color-bg)',
      position: 'relative', paddingTop: 54,
    }}>
      <ScreenTopBar current={1} total={4} onBack={() => router.back()} />
      <ChapterHeading
        numeral="I."
        lines={['정보를', '알려 주세요']}
        subtitle="사주 명식의 네 가지 출생 정보가 필요합니다"
      />
      <ProfileForm />
    </main>
  );
}
