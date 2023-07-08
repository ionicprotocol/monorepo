import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const TextStyleConfig: ComponentStyleConfig = {
  baseStyle: (props) => ({
    alignItems: 'center',
    color: mode('iBlack', 'iWhite')(props),
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    justifyContent: 'center',
  }),
  defaultProps: {
    variant: 'default',
  },
  sizes: {
    lg: {
      fontSize: {
        base: '20px',
      },
      lineHeight: {
        base: '30px',
      },
    },
    md: {
      fontSize: {
        base: '14px',
      },
      lineHeight: {
        base: '20px',
      },
    },
    sm: {
      fontSize: {
        base: '12px',
      },
      lineHeight: {
        base: '18px',
      },
    },
    xl: {
      fontSize: {
        base: '24px',
      },
      lineHeight: {
        base: '34px',
      },
    },
    xs: {
      fontSize: {
        base: '10px',
      },
      lineHeight: {
        base: '14px',
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
    tableHeader: {
      color: 'iLightGray',
      textTransform: 'uppercase',
    },
    tnumber: {
      fontFamily: "'Inter', sans-serif",
      fontFeatureSettings: 'tnum',
      fontWeight: 'normal',
    },
  },
};
