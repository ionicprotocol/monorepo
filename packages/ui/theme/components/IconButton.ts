import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const IconButtonStyleConfig: ComponentStyleConfig = {
  baseStyle: {
    borderRadius: 'xl',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    _active: { opacity: 0.8 },
    mr: '-px',
    _disabled: {
      opacity: 0.4,
      cursor: 'not-allowed',
      boxShadow: 'none',
    },
  },
  sizes: {
    base: {
      height: 8,
      minWidth: 8,
      fontSize: 14,
    },
    sm: {
      height: 8,
      minWidth: 8,
      fontSize: 14,
    },
    md: {
      height: 10,
      minWidth: 10,
      fontSize: 16,
    },
    lg: {
      height: 10,
      minWidth: 10,
      fontSize: 16,
    },
  },
  variants: {
    filter: (props) => ({
      bg: props.isSelected ? mode('ecru', 'ecru')(props) : mode('whiteBg', 'raisinBlack')(props),
      color: props.isSelected
        ? mode('raisinBlack', 'raisinBlack')(props)
        : mode('raisinBlack', 'ecru')(props),
      borderColor: mode('ecru', 'ecru')(props),
      _hover: {
        bg: mode('ecru', 'ecru')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
        borderColor: mode('ecru', 'ecru')(props),
        _disabled: {
          bg: mode('whiteBg', 'raisinBlack')(props),
          color: mode('ecru', 'ecru')(props),
          borderColor: mode('ecru', 'ecru')(props),
        },
      },
    }),
    _outline: (props) => ({
      bg: mode('whiteBg', 'raisinBlack')(props),
      color: mode('ecru', 'ecru')(props),
      borderColor: mode('ecru', 'ecru')(props),
      _hover: {
        bg: mode('ecru', 'ecru')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
        borderColor: mode('ecru', 'ecru')(props),
        _disabled: {
          bg: mode('whiteBg', 'raisinBlack')(props),
          color: mode('ecru', 'ecru')(props),
          borderColor: mode('ecru', 'ecru')(props),
        },
      },
    }),
  },
  defaultProps: {
    size: ['base', 'sm', 'md', 'lg'],
    variant: '_outline',
  },
};
