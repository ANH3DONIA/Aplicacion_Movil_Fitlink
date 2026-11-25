export const Colors = {
  brandBlue: '#2447FF',
  brandYellow: '#FFD60A',
  brandMagenta: '#F0239A',

  night: '#0B1026',
  ice: '#F3F5FF',
  surfaceWhite: '#FFFFFF',

  success: '#1B7F45',
  warning: '#F08A00',
  error: '#D63B3B',
  info: '#0A7EA4',

  night70: 'rgba(11,16,38,0.74)',
  night65: 'rgba(11,16,38,0.68)',
  borderCrisp: '#D5DCF0',
  borderSubtle: '#DCE2F2',

  successText: '#146335',
  warningText: '#7A4600',
  errorText: '#A62424',
  infoText: '#075E7B',
  magentaDark: '#B3126F',

  successSoft: '#E8F5EE',
  warningSoft: '#FFF4E5',
  errorSoft: '#FDECEC',
  infoSoft: '#E6F4F8',
  magentaSoft: '#FDE8F5',
  blueSoft: '#EEF1FF',

  white18: 'rgba(255,255,255,0.18)',
  white75: 'rgba(255,255,255,0.88)',
  night35: 'rgba(11,16,38,0.35)',

  desktopBackdrop: '#E6EAF8',
} as const;

export type ColorToken = keyof typeof Colors;
