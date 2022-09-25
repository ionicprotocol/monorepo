import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const TextStyleConfig: ComponentStyleConfig = {
  baseStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizes: {},
  variants: {
    default: {
      fontSize: {
        base: 14,
        sm: 14,
        md: 16,
        lg: 16,
      },
    },
    heading: (props) => ({
      fontSize: {
        base: 32,
        sm: 32,
        md: 36,
        lg: 36,
      },
      color: mode('raisinBlack', 'whiteBg')(props),
    }),
    title: (props) => ({
      fontSize: {
        base: 20,
        sm: 20,
        md: 24,
        lg: 24,
      },
      color: mode('raisinBlack', 'whiteBg')(props),
    }),
    lgText: (props) => ({
      color: mode('raisinBlack', 'whiteBg')(props),
      fontSize: {
        base: 18,
        sm: 18,
        md: 20,
        lg: 20,
      },
    }),
    mdText: (props) => ({
      color: mode('raisinBlack', 'whiteBg')(props),
      fontSize: {
        base: 16,
        sm: 16,
        md: 18,
        lg: 18,
      },
    }),
    smText: (props) => ({
      color: mode('raisinBlack', 'whiteBg')(props),
      fontSize: {
        base: 14,
        sm: 14,
        md: 16,
        lg: 16,
      },
    }),
    panelLgText: (props) => ({
      fontSize: {
        base: 18,
        sm: 18,
        md: 20,
        lg: 20,
      },
      color: mode('raisinBlack', 'raisinBlack')(props),
    }),
    panelMdText: (props) => ({
      fontSize: {
        base: 16,
        sm: 16,
        md: 18,
        lg: 18,
      },
      color: mode('raisinBlack', 'raisinBlack')(props),
    }),
    panelSmText: (props) => ({
      fontSize: {
        base: 14,
        sm: 14,
        md: 16,
        lg: 16,
      },
      color: mode('raisinBlack', 'raisinBlack')(props),
    }),
    panelHeading: (props) => ({
      fontSize: {
        base: 42,
        sm: 42,
        md: 46,
        lg: 46,
      },
      color: mode('raisinBlack', 'raisinBlack')(props),
    }),
    panelTitle: (props) => ({
      fontSize: {
        base: 28,
        sm: 28,
        md: 32,
        lg: 32,
      },
      color: mode('raisinBlack', 'raisinBlack')(props),
    }),
  },
  defaultProps: {
    variant: 'default',
  },
};
