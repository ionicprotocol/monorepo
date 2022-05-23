import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const ButtonStyleConfig: ComponentStyleConfig = {
  baseStyle: {
    fontWeight: 'bold',
    borderRadius: 'xl',
    fontFamily: 'heading',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizes: {
    sm: {
      fontSize: 'sm',
      px: 3,
      py: 3,
    },
    md: {
      fontSize: 'md',
      px: 3,
      py: 3,
      minWidth: '40px',
    },
    lg: {
      fontSize: 'xl',
      px: 4,
      py: 4,
    },
  },
  variants: {
    ghost: {
      _hover: {
        bg: 'ecru80',
        color: 'raisinBlack',
      },
    },
    solid: (props) => ({
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

    outline: (props) => ({
      bg: mode('whiteBg', 'raisinBlack')(props),
      color: mode('raisinBlack', 'ecru')(props),
      borderWidth: 2,
      borderColor: mode('ecru', 'ecru')(props),
      _hover: {
        bg: mode('ecru80', 'ecru80')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
      },
    }),
    topBar: (props) => ({
      ...props.theme.components.Button.variants.solid(props),
      height: '40px',
      ml: 2,
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
    }),
  },
  defaultProps: {
    size: 'md',
    variant: 'solid',
  },
};
