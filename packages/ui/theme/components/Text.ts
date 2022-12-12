import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const TextStyleConfig: ComponentStyleConfig = {
  defaultProps: {
    variant: 'default',
  },
  baseStyle: (props) => ({
    alignItems: 'center',
    justifyContent: 'center',
    color: mode('raisinBlack', 'whiteBg')(props),
  }),
  sizes: {
    '2xs': {
      fontSize: {
        base: 10,
        sm: 10,
        md: 12,
        lg: 12,
      },
    },
    xs: {
      fontSize: {
        base: 12,
        sm: 12,
        md: 14,
        lg: 14,
      },
    },
    sm: {
      fontSize: {
        base: 14,
        sm: 14,
        md: 16,
        lg: 16,
      },
    },
    md: {
      fontSize: {
        base: 16,
        sm: 16,
        md: 18,
        lg: 18,
      },
    },
    lg: {
      fontSize: {
        base: 18,
        sm: 18,
        md: 20,
        lg: 20,
      },
      lineHeight: {
        base: 6,
      },
    },
    xl: {
      fontSize: {
        base: 20,
        sm: 20,
        md: 24,
        lg: 24,
      },
    },
    '2xl': {
      fontSize: {
        base: 32,
        sm: 32,
        md: 36,
        lg: 36,
      },
    },
    '3xl': {
      fontSize: {
        base: 42,
        sm: 42,
        md: 46,
        lg: 46,
      },
    },
  },
  variants: {
    default: {},
    number: {
      fontFamily: "'Inter', sans-serif",
    },
    tnumber: {
      fontFamily: "'Inter', sans-serif",
      fontFeatureSettings: 'tnum',
      fontWeight: 'normal',
    },
    'table-head': {
      fontWeight: 'normal',
      lineHeight: 1.25,
      textAlign: 'right',
      opacity: 0.9,
    },
    panelMdText: (props) => ({
      color: mode('raisinBlack', 'raisinBlack')(props),
    }),
    panelSmText: (props) => ({
      color: mode('raisinBlack', 'raisinBlack')(props),
    }),
  },
};
