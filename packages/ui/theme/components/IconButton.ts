import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const IconButtonStyleConfig: ComponentStyleConfig = {
  baseStyle: {
    _active: { opacity: 0.8 },
    _disabled: {
      boxShadow: 'none',
      cursor: 'not-allowed',
      opacity: 0.4,
    },
    alignItems: 'center',
    borderRadius: 'xl',
    borderWidth: 2,
    display: 'inline-flex',
    justifyContent: 'center',
    mr: '-px',
  },
  defaultProps: {
    size: ['base', 'sm', 'md', 'lg'],
    variant: '_outline',
  },
  sizes: {
    base: {
      fontSize: 14,
      height: 8,
      minWidth: 8,
    },
    lg: {
      fontSize: 16,
      height: 10,
      minWidth: 10,
    },
    md: {
      fontSize: 16,
      height: 10,
      minWidth: 10,
    },
    sm: {
      fontSize: 14,
      height: 8,
      minWidth: 8,
    },
  },
  variants: {
    _outline: (props) => ({
      _hover: {
        _disabled: {
          bg: mode('whiteBg', 'raisinBlack')(props),
          borderColor: mode('ecru', 'ecru')(props),
          color: mode('ecru', 'ecru')(props),
        },
        bg: mode('ecru', 'ecru')(props),
        borderColor: mode('ecru', 'ecru')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
      },
      bg: mode('whiteBg', 'raisinBlack')(props),
      borderColor: mode('ecru', 'ecru')(props),
      color: mode('ecru', 'ecru')(props),
    }),
    filter: (props) => ({
      _hover: {
        _disabled: {
          bg: mode('whiteBg', 'raisinBlack')(props),
          borderColor: mode('ecru', 'ecru')(props),
          color: mode('ecru', 'ecru')(props),
        },
        bg: mode('ecru', 'ecru')(props),
        borderColor: mode('ecru', 'ecru')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
      },
      bg: props.isSelected ? mode('ecru', 'ecru')(props) : mode('whiteBg', 'raisinBlack')(props),
      borderColor: mode('ecru', 'ecru')(props),
      color: props.isSelected
        ? mode('raisinBlack', 'raisinBlack')(props)
        : mode('raisinBlack', 'ecru')(props),
    }),
  },
};
