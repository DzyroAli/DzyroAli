import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_USERS, type User } from '../data/mockData';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  clearError: () => void;
}

const TEST_ACCOUNTS: Record<string, { password: string; userId: string }> = {
  'admin@platform.uz': { password: 'Admin@123456', userId: 'u1' },
  'creator@platform.uz': { password: 'Creator@123456', userId: 'u2' },
  'user@platform.uz': { password: 'User@123456', userId: 'u3' },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        await new Promise(r => setTimeout(r, 800));

        const account = TEST_ACCOUNTS[email.toLowerCase()];
        const mockUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (account && account.password === password && mockUser) {
          set({
            user: mockUser,
            token: `mock_jwt_${mockUser.id}_${Date.now()}`,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        }

        // Also allow any user from mock data with password 'password123'
        if (mockUser && password === 'password123') {
          set({
            user: mockUser,
            token: `mock_jwt_${mockUser.id}_${Date.now()}`,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return true;
        }

        set({ isLoading: false, error: 'Invalid email or password' });
        return false;
      },

      signup: async (name: string, email: string, _password: string) => {
        set({ isLoading: true, error: null });
        await new Promise(r => setTimeout(r, 1000));

        if (MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          set({ isLoading: false, error: 'Email already in use' });
          return false;
        }

        const newUser: User = {
          id: `u_${Date.now()}`,
          name,
          email,
          username: email.split('@')[0],
          avatar: '',
          bio: '',
          role: 'user',
          createdAt: new Date().toISOString(),
          followersCount: 0,
          followingCount: 0,
          productsCount: 0,
        };

        set({
          user: newUser,
          token: `mock_jwt_${newUser.id}_${Date.now()}`,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) set({ user: { ...user, ...updates } });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
