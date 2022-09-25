import { theme } from '@chakra-ui/react';
import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const ButtonStyleConfig: ComponentStyleConfig = {
  baseStyle: {
    ...theme.components.Button.baseStyle,
    fontWeight: 'bold',
    borderRadius: 'xl',
    fontFamily: 'heading',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizes: {
    base: {
      height: 8,
      minWidth: 8,
      fontSize: 14,
      px: 2,
      py: 2,
    },
    sm: {
      height: 8,
      minWidth: 8,
      fontSize: 14,
      px: 2,
      py: 2,
    },
    md: {
      height: 10,
      minWidth: 10,
      fontSize: 16,
      px: 3,
      py: 3,
    },
    lg: {
      height: 10,
      minWidth: 10,
      fontSize: 16,
      px: 3,
      py: 3,
    },
  },
  variants: {
    ...theme.components.Button.variants,
    _ghost: {
      _hover: {
        bg: 'ecru80',
        color: 'raisinBlack',
      },
    },
    _solid: (props) => ({
      bg: mode('ecru', 'ecru')(props),
      color: mode('raisinBlack', 'raisinBlack')(props),
      _hover: {
        bg: mode('ecru80', 'ecru80')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
      },
      _active: { opacity: 0.8 },
    }),
    silver: (props) => ({
      bg: mode('silverMetallic', 'silverMetallic')(props),
      color: mode('raisinBlack', 'raisinBlack')(props),
      _hover: {
        bg: mode('silverMetallic80', 'silverMetallic80')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
      },
      _active: { opacity: 0.8 },
    }),

    _outline: (props) => ({
      bg: mode('whiteBg', 'raisinBlack')(props),
      color: mode('raisinBlack', 'ecru')(props),
      borderWidth: 2,
      borderColor: mode('ecru', 'ecru')(props),
      _hover: {
        bg: mode('ecru80', 'ecru80')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
      },
    }),
    filter: (props) => ({
      bg: props.isSelected ? mode('ecru', 'ecru')(props) : mode('whiteBg', 'raisinBlack')(props),
      color: props.isSelected
        ? mode('raisinBlack', 'raisinBlack')(props)
        : mode('gunmetal', 'ecru')(props),
      borderWidth: 2,
      borderColor: mode('ecru', 'ecru')(props),
      mr: '-px',
      _active: { opacity: 0.8 },
      _hover: {
        bg: mode('ecru', 'ecru')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
        borderColor: mode('ecru', 'ecru')(props),
      },
    }),
    link: (props) => ({
      color: mode('raisinBlack', 'whiteBg')(props),
      _hover: {
        color: mode('ecru', 'ecru')(props),
      },
      p: {
        lg: 0,
        md: 0,
        sm: 0,
        base: 0,
      },
      height: {
        lg: 6,
        md: 6,
        sm: 6,
        base: 6,
      },
    }),
    panelLink: (props) => ({
      color: mode('raisinBlack', 'raisinBlack')(props),
      _hover: {
        color: mode('ecru', 'ecru')(props),
      },
      p: {
        lg: 0,
        md: 0,
        sm: 0,
        base: 0,
      },
      height: {
        lg: 6,
        md: 6,
        sm: 6,
        base: 6,
      },
    }),
    listed: (props) => ({
      color: mode('raisinBlack', 'whiteBg')(props),
      bg: mode('whiteBg', 'raisinBlack')(props),
      _hover: {
        bg: mode('silverMetallic30', 'ecru30')(props),
      },
      _active: {
        bg: mode('silverMetallic80', 'ecru80')(props),
      },
    }),
  },
  defaultProps: {
    size: ['base', 'sm', 'md', 'lg'],
    variant: '_solid',
  },
};
