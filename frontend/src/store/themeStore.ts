import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDark: false,
      toggle: () => {
        const newDark = !get().isDark;
        set({ isDark: newDark });
        document.documentElement.classList.toggle('dark', newDark);
      },
      setDark: (dark: boolean) => {
        set({ isDark: dark });
        document.documentElement.classList.toggle('dark', dark);
      },
    }),
    { name: 'theme-storage' }
  )
);
