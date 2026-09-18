import { create } from 'zustand';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { DarkColors, LightColors } from '../constants/theme';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  setMode: (mode) => set({ mode }),
}));

export function useAppTheme() {
  const mode = useThemeStore((state) => state.mode);
  const deviceScheme = useDeviceColorScheme();

  const isDark = mode === 'system' ? deviceScheme === 'dark' : mode === 'dark';
  const colors = isDark ? DarkColors : LightColors;

  return {
    isDark,
    mode,
    colors,
    setMode: useThemeStore.getState().setMode,
  };
}
