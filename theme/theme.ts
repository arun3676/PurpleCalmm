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
  primary: '#C5B5FF',        // Lavender
  primaryDark: '#A28BFF',    // Deeper Lavender
  primaryDarker: '#7D68E8',  // Indigo accent
  accent: '#FFC8DD',         // Pink paws
  background: '#F1E8FF',     // Pastel lavender bg
  surface: '#FFFFFF',        // White cards
  text: '#1F2430',           // Dark text
  mutedText: '#6B6E7A',
  success: '#48C78E',
  danger: '#F87171',
  sparkle: '#E9DDFF'
};

export const VNightJazz: AppPalette = {
  ...PurpleTheme,
  primary: '#8B5CF6',
  primaryDark: '#5B21B6',
  primaryDarker: '#2E1065',
  accent: '#C084FC',
  background: '#0A0813',
  surface: '#120F20',
  text: '#F6F3FF',
  mutedText: '#C9C6F0',
  sparkle: '#A78BFA'
};
