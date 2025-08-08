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
  primary: '#A78BFA',
  primaryDark: '#7C3AED',
  primaryDarker: '#4C1D95',
  accent: '#FDE68A',
  background: '#0B0B14',
  surface: '#151524',
  text: '#F8F7FF',
  mutedText: '#C9C6F0',
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
