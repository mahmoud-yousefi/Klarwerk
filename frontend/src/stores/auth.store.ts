import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole = 'customer' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  color: string;
}

export const ADMIN_EMAIL = 'admin@klarwerk.de';
export const ADMIN_PASSWORD = 'klarwerk2026';

const palette = ['#5865F2', '#9B72F2', '#4FA3A5', '#D9587A', '#C28A3D', '#3E8BD8'];

const avatarColor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 997;
  return palette[hash % palette.length];
};

const titleFromEmail = (email: string) => {
  const local = email.split('@')[0] ?? 'Klarwerk';
  const words = local.replace(/[._-]+/g, ' ').trim().split(/\s+/);
  return words
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'Klarwerk Kunde';
};

const buildUser = (input: {
  name?: string;
  email: string;
  role?: UserRole;
}): AuthUser => {
  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() || titleFromEmail(email);
  return {
    id: `usr_${Math.random().toString(36).slice(2, 10)}`,
    name,
    email,
    role: input.role ?? 'customer',
    createdAt: new Date().toISOString(),
    color: avatarColor(email || name),
  };
};

interface AuthState {
  user: AuthUser | null;
  login: (email: string, password?: string) => AuthUser;
  signup: (name: string, email: string, password?: string) => AuthUser;
  loginAsAdmin: () => AuthUser;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (email, _password) => {
        const existingAdmin = email.trim().toLowerCase() === ADMIN_EMAIL;
        const user = buildUser({
          email,
          role: existingAdmin ? 'admin' : 'customer',
          name: existingAdmin ? 'Aylin Demir' : undefined,
        });
        set({ user });
        return user;
      },
      signup: (name, email, _password) => {
        const user = buildUser({ name, email });
        set({ user });
        return user;
      },
      loginAsAdmin: () => {
        const user: AuthUser = {
          id: 'usr_admin',
          name: 'Aylin Demir',
          email: ADMIN_EMAIL,
          role: 'admin',
          createdAt: new Date().toISOString(),
          color: '#5865F2',
        };
        set({ user });
        return user;
      },
      logout: () => set({ user: null }),
    }),
    {
      name: 'klarwerk.auth.v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

export const useIsAdmin = () => useAuthStore((state) => state.user?.role === 'admin');
