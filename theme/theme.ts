export type AppPalette = {
  primary: string;
  primaryDark: string;
  primaryDarker: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  success: string;
  danger: string;
  sparkle: string;
};

export const PurpleTheme: AppPalette = {
  primary: '#6A5ACD',        // Soft Indigo
  primaryDark: '#5B3FD6',    // Deeper Indigo
  primaryDarker: '#2E2A5A',  // Night Indigo
  accent: '#F7B3D0',         // Pink Paws
  background: '#0B0B14',
  surface: '#151524',
  text: '#F6F3FF',
  mutedText: '#BFB7E6',
  success: '#4ADE80',
  danger: '#F87171',
  sparkle: '#C4B5FD'
};

export const VNightJazz: AppPalette = {
  ...PurpleTheme,
  primary: '#8B5CF6',
  primaryDark: '#5B21B6',
  primaryDarker: '#2E1065',
  accent: '#C084FC',
  background: '#0A0813',
  surface: '#120F20',
  sparkle: '#A78BFA'
};
