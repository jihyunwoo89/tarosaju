import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { HourBranch } from '@/lib/saju';
import type { Category, Gender } from '@/lib/schema';

export type { Category, Gender };

export type Profile = {
  name: string;
  gender: Gender;
  birthDate: string;   // 'YYYY-MM-DD'
  hourBranch: HourBranch;
};

export type CardSelection = { id: number; reversed: boolean };

type SessionState = {
  profile: Profile | null;
  category: Category | null;
  cards: CardSelection[];   // 길이 0 또는 3
  setProfile: (p: Profile) => void;
  setCategory: (c: Category) => void;
  setCards: (c: CardSelection[]) => void;
  resetForReroll: () => void; // 카테고리 + 카드만
  resetAll: () => void;
};

export const useSession = create<SessionState>()(
  persist(
    set => ({
      profile: null,
      category: null,
      cards: [],
      setProfile: p => set({ profile: p }),
      setCategory: c => set({ category: c }),
      setCards: c => set({ cards: c }),
      resetForReroll: () => set({ category: null, cards: [] }),
      resetAll: () => set({ profile: null, category: null, cards: [] }),
    }),
    {
      name: 'tarosaju-session',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
