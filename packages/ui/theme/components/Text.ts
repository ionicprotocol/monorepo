import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const TextStyleConfig: ComponentStyleConfig = {
  baseStyle: (props) => ({
    alignItems: 'center',
    color: mode('raisinBlack', 'whiteBg')(props),
    justifyContent: 'center',
  }),
  defaultProps: {
    variant: 'default',
  },
  sizes: {
    '2xl': {
      fontSize: {
        base: 32,
        lg: 36,
        md: 36,
        sm: 32,
      },
    },
    '2xs': {
      fontSize: {
        base: 10,
        lg: 12,
        md: 12,
        sm: 10,
      },
    },
    '3xl': {
      fontSize: {
        base: 42,
        lg: 46,
        md: 46,
        sm: 42,
      },
    },
    lg: {
      fontSize: {
        base: 18,
        lg: 20,
        md: 20,
        sm: 18,
      },
      lineHeight: {
        base: 6,
      },
    },
    md: {
      fontSize: {
        base: 16,
        lg: 18,
        md: 18,
        sm: 16,
      },
    },
    sm: {
      fontSize: {
        base: 14,
        lg: 16,
        md: 16,
        sm: 14,
      },
    },
    xl: {
      fontSize: {
        base: 20,
        lg: 24,
        md: 24,
        sm: 20,
      },
    },
    xs: {
      fontSize: {
        base: 12,
        lg: 14,
        md: 14,
        sm: 12,
      },
    },
  },
  variants: {
    default: {},
    number: {
      fontFamily: "'Inter', sans-serif",
    },
    'table-head': {
      fontWeight: 'normal',
      lineHeight: 1.25,
      opacity: 0.9,
      textAlign: 'right',
    },
    tnumber: {
      fontFamily: "'Inter', sans-serif",
      fontFeatureSettings: 'tnum',
      fontWeight: 'normal',
    },
  },
};
