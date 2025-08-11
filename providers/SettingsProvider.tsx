import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { loadSettings as loadStored, saveSettings as saveStored, AppSettings } from '../utils/storage';

const DEFAULT_SETTINGS = {
  theme: 'purple' as 'purple'|'vjazz',
  reduceMotion: false,
  migraineDefaultMinutes: 10,
  voice: 'ko' as 'ko'|'en',
  masterVolume: 0.8,
};

type Settings = typeof DEFAULT_SETTINGS;
type Ctx = Settings & {
  setTheme: (t: Settings['theme']) => Promise<void>;
  setReduceMotion: (b: boolean) => Promise<void>;
  setMigraineDefaultMinutes: (m: number) => Promise<void>;
  setVoice: (v: 'ko'|'en') => Promise<void>;
  setMasterVolume: (n: number) => Promise<void>;
  // Back-compat: expose legacy API signatures used elsewhere
  hydrated: boolean;
  setMigraineMinutes?: (n: number) => Promise<void>;
};

const SettingsCtx = createContext<Ctx | null>(null);

export function SettingsProvider({ children, onApplyTheme }:{ children: React.ReactNode, onApplyTheme?: (t: any) => void }) {
  const [state, setState] = useState<Settings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Hydrate from unified storage
  useEffect(() => {
    (async () => {
      const s = await loadStored();
      // Map stored fields → new state
      const theme = (s.theme === 'purple' || s.theme === 'vjazz') ? s.theme : 'purple';
      // Try to read voice/masterVolume if present in raw storage (best-effort)
      let voice: 'ko'|'en' = 'ko';
      let masterVolume = 0.8;
      try {
        if (typeof window !== 'undefined') {
          const raw = window.localStorage.getItem('purr.settings.v1');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && (parsed.voice === 'ko' || parsed.voice === 'en')) voice = parsed.voice;
            const mv = Number(parsed?.masterVolume);
            if (Number.isFinite(mv)) masterVolume = Math.max(0, Math.min(1, mv));
          }
        }
      } catch {}
      setState({
        theme,
        reduceMotion: !!s.reduceMotion,
        migraineDefaultMinutes: Math.max(1, Math.min(120, Number((s as any).migraineMinutes ?? 10))) || 10,
        voice,
        masterVolume,
      });
      onApplyTheme?.(theme);
      setHydrated(true);
    })();
  }, []);

  async function save(next: Partial<Settings>) {
    // Persist in existing store; map fields
    const cur = stateRef.current;
    const merged: Settings = { ...cur, ...next } as Settings;
    const mapped: Partial<AppSettings & any> = {
      theme: merged.theme,
      reduceMotion: merged.reduceMotion,
      migraineMinutes: Math.max(1, Math.min(120, Math.floor(merged.migraineDefaultMinutes)))
    };
    // Include new fields so they persist alongside
    (mapped as any).voice = merged.voice;
    (mapped as any).masterVolume = merged.masterVolume;
    await saveStored(mapped);
    return merged;
  }

  const setTheme = async (t: Settings['theme']) => {
    const merged = await save({ theme: t });
    setState(merged);
    onApplyTheme?.(t);
  };
  const setReduceMotion = async (b: boolean) => setState(await save({ reduceMotion: b }));
  const setMigraineDefaultMinutes = async (m: number) => setState(await save({ migraineDefaultMinutes: Math.max(1, Math.min(120, Math.floor(m))) }));
  const setVoice = async (v: 'ko'|'en') => setState(await save({ voice: v }));
  const setMasterVolume = async (n: number) => setState(await save({ masterVolume: Math.max(0, Math.min(1, n)) }));

  // Back-compat alias
  const setMigraineMinutes = async (n: number) => setMigraineDefaultMinutes(n);

  return (
    <SettingsCtx.Provider value={{
      ...state,
      setTheme,
      setReduceMotion,
      setMigraineDefaultMinutes,
      setVoice,
      setMasterVolume,
      hydrated,
      setMigraineMinutes,
    }}>
      {children}
    </SettingsCtx.Provider>
  );
}

export function useSettings() {
  const v = useContext(SettingsCtx);
  if (!v) throw new Error('useSettings must be used inside SettingsProvider');
  return v;
}
