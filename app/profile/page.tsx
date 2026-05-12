import { ProgressDots } from '@/components/ui/ProgressDots';
import { ProfileForm } from '@/components/form/ProfileForm';

export default function ProfilePage() {
  return (
    <main className="min-h-[100dvh] py-10">
      <ProgressDots current={1} total={3} />
      <h1 className="font-display text-3xl text-center mb-8">정보를 알려 주세요</h1>
      <ProfileForm />
    </main>
  );
}
