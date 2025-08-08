import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useFonts as useManrope, Manrope_600_SemiBold, Manrope_700_Bold } from '@expo-google-fonts/manrope';
import { useFonts as usePoppins, Poppins_700_Bold } from '@expo-google-fonts/poppins';
import { useFonts as useInter, Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { PurpleTheme, VNightJazz, AppPalette } from './theme';
import { loadSettings, saveSettings, Settings } from '../utils/storage';

type ThemeContextValue = {
  colors: AppPalette;
  fontsReady: boolean;
  isDark: boolean;
  vibe: boolean;
  reduceMotion: boolean;
  setVibe: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  setThemeName: (n: 'purple' | 'vjazz') => void;
  themeName: 'purple' | 'vjazz';
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<'purple' | 'vjazz'>('purple');
  const [vibe, setVibe] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const colors = useMemo<AppPalette>(() => (themeName === 'vjazz' || vibe ? VNightJazz : PurpleTheme), [themeName, vibe]);

  const [manropeLoaded] = useManrope({ Manrope_600_SemiBold, Manrope_700_Bold });
  const [poppinsLoaded] = usePoppins({ Poppins_700_Bold });
  const [interLoaded] = useInter({ Inter_400Regular, Inter_500Medium });

  const fontsReady = manropeLoaded && poppinsLoaded && interLoaded;

  useEffect(() => {
    (async () => {
      const s = await loadSettings();
      if (s) {
        setVibe(Boolean(s.vibe));
        setReduceMotion(Boolean(s.reduceMotion));
        setThemeName((s.themeName as any) || 'purple');
      }
    })();
  }, []);

  useEffect(() => {
    const s: Settings = { themeName, vibe, reduceMotion };
    saveSettings(s);
  }, [themeName, vibe, reduceMotion]);

  const value = useMemo(
    () => ({ colors, fontsReady, isDark: true, vibe, reduceMotion, setVibe, setReduceMotion, setThemeName, themeName }),
    [colors, fontsReady, vibe, reduceMotion, themeName]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}

export const textStyles = {
  h1: { fontFamily: 'Poppins_700_Bold' as const, fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: 'Manrope_700_Bold' as const, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: 'Manrope_600_SemiBold' as const, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: 'Inter_400Regular' as const, fontSize: 16, lineHeight: 22 },
  bodyMedium: { fontFamily: 'Inter_500Medium' as const, fontSize: 16, lineHeight: 22 }
};
