import { describe, it, expect, beforeEach } from 'vitest';
import { useSession } from './session';

describe('useSession', () => {
  beforeEach(() => {
    sessionStorage.clear();
    useSession.setState(useSession.getState(), true);
    useSession.getState().resetAll();
  });

  it('starts empty', () => {
    const s = useSession.getState();
    expect(s.profile).toBeNull();
    expect(s.category).toBeNull();
    expect(s.cards).toEqual([]);
  });

  it('setProfile stores profile', () => {
    useSession.getState().setProfile({ name: '홍길동', gender: '남', birthDate: '1990-03-15', hourBranch: '인' });
    expect(useSession.getState().profile?.name).toBe('홍길동');
  });

  it('setCategory stores category', () => {
    useSession.getState().setCategory('연애');
    expect(useSession.getState().category).toBe('연애');
  });

  it('setCards stores 3 drawn cards', () => {
    useSession.getState().setCards([
      { id: 0, reversed: false },
      { id: 6, reversed: true  },
      { id: 19, reversed: false },
    ]);
    expect(useSession.getState().cards).toHaveLength(3);
  });

  it('resetForReroll clears category + cards but keeps profile', () => {
    const s = useSession.getState();
    s.setProfile({ name: '홍길동', gender: '남', birthDate: '1990-03-15', hourBranch: '인' });
    s.setCategory('연애');
    s.setCards([{ id: 0, reversed: false }, { id: 1, reversed: true }, { id: 2, reversed: false }]);
    s.resetForReroll();
    const s2 = useSession.getState();
    expect(s2.profile?.name).toBe('홍길동');
    expect(s2.category).toBeNull();
    expect(s2.cards).toEqual([]);
  });

  it('resetAll clears everything', () => {
    const s = useSession.getState();
    s.setProfile({ name: '홍길동', gender: '남', birthDate: '1990-03-15', hourBranch: '인' });
    s.resetAll();
    expect(useSession.getState().profile).toBeNull();
  });
});
