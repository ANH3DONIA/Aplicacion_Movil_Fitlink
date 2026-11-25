import { TextStyle } from 'react-native';

export const FontFamilies = {
  soraBold: 'Sora_700Bold',
  soraSemiBold: 'Sora_600SemiBold',
  interSemiBold: 'Inter_600SemiBold',
  interMedium: 'Inter_500Medium',
  interRegular: 'Inter_400Regular',
} as const;

export const Typography: Record<
  | 'display'
  | 'title'
  | 'subtitle'
  | 'subtitleSora'
  | 'body'
  | 'bodyMedium'
  | 'bodySemiBold'
  | 'label'
  | 'labelSemiBold',
  TextStyle
> = {
  display: {
    fontFamily: FontFamilies.soraBold,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  title: {
    fontFamily: FontFamilies.soraSemiBold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  subtitleSora: {
    fontFamily: FontFamilies.soraSemiBold,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  body: {
    fontFamily: FontFamilies.interRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: FontFamilies.interMedium,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySemiBold: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    fontFamily: FontFamilies.interMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  labelSemiBold: {
    fontFamily: FontFamilies.interSemiBold,
    fontSize: 12,
    lineHeight: 16,
  },
};

export const tabularNums: TextStyle = {
  fontVariant: ['tabular-nums'],
};
