export const THEME_TOKENS = {
  purple: {
    bg: '#EEE8FF',
    surface: '#F6F0FF',
    text: '#1A102B',
    mutedText: '#5B4B7D',
    primary: '#7046FF',
    primaryText: '#FFFFFF',
    border: '#D9CCFF',
    shadow: 'rgba(50, 30, 120, 0.20)',
  },
  vjazz: {
    bg: '#EDE6FF',
    surface: '#F7F2FF',
    text: '#190F2A',
    mutedText: '#574A79',
    primary: '#6B3CFF',
    primaryText: '#FFFFFF',
    border: '#CFC0FF',
    shadow: 'rgba(40, 22, 95, 0.25)',
  },
} as const;

export type ThemeKey = keyof typeof THEME_TOKENS;


