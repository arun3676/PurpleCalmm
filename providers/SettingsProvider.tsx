import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadSettings, saveSettings, AppSettings } from '../utils/storage';

type Ctx = {
  settings: AppSettings;
  hydrated: boolean;
  setTheme: (t: AppSettings['theme']) => Promise<void>;
  setReduceMotion: (v: boolean) => Promise<void>;
  setMigraineMinutes: (n: number) => Promise<void>;
};

const SettingsCtx = createContext<Ctx | null>(null);

export function SettingsProvider({ children, onApplyTheme }:{ children: React.ReactNode, onApplyTheme?: (t: AppSettings['theme']) => void }) {
  const [settings, setSettings] = useState<AppSettings>({ theme: 'purple', reduceMotion: false, migraineMinutes: 15 });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await loadSettings();
      setSettings(s);
      onApplyTheme?.(s.theme);
      setHydrated(true);
    })();
  }, []);

  const setTheme = async (t: AppSettings['theme']) => {
    const s = await saveSettings({ theme: t });
    setSettings(s);
    onApplyTheme?.(s.theme);
  };
  const setReduceMotion = async (v: boolean) => setSettings(await saveSettings({ reduceMotion: v }));
  const setMigraineMinutes = async (n: number) => setSettings(await saveSettings({ migraineMinutes: n }));

  return (
    <SettingsCtx.Provider value={{ settings, hydrated, setTheme, setReduceMotion, setMigraineMinutes }}>
      {children}
    </SettingsCtx.Provider>
  );
}

export function useSettings() {
  const v = useContext(SettingsCtx);
  if (!v) throw new Error('useSettings must be used inside SettingsProvider');
  return v;
}
