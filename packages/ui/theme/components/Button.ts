import { theme } from '@chakra-ui/react';
import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const ButtonStyleConfig: ComponentStyleConfig = {
  ...theme.components.Button,
  baseStyle: {
    ...theme.components.Button.baseStyle,
    fontWeight: 'bold',
    borderRadius: 'xl',
    fontFamily: 'heading',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  variants: {
    ...theme.components.Button.variants,
    _ghost: {
      ...theme.components.Button.variants?.ghost,
      _hover: {
        bg: 'ecru80',
        color: 'raisinBlack',
      },
    },
    _solid: (props) => ({
      ...theme.components.Button.variants?.solid,
      bg: mode('ecru', 'ecru')(props),
      color: mode('raisinBlack', 'raisinBlack')(props),
      _hover: {
        bg: mode('ecru80', 'ecru80')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
      },
      _active: { opacity: 0.8 },
    }),
    silver: (props) => ({
      ...theme.components.Button.variants?.solid,
      bg: mode('silverMetallic', 'silverMetallic')(props),
      color: mode('raisinBlack', 'raisinBlack')(props),
      _hover: {
        bg: mode('silverMetallic80', 'silverMetallic80')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
      },
      _active: { opacity: 0.8 },
    }),

    _outline: (props) => ({
      ...theme.components.Button.variants?.outline,
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
      ...theme.components.Button.variants?.solid,
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
    _link: (props) => ({
      ...theme.components.Button.variants?.link,
      color: mode('raisinBlack', 'whiteBg')(props),
      _hover: {
        color: mode('ecru', 'ecru')(props),
      },
    }),
    panelLink: (props) => ({
      ...theme.components.Button.variants?.link,
      color: mode('raisinBlack', 'raisinBlack')(props),
      _hover: {
        color: mode('ecru', 'ecru')(props),
      },
    }),
    listed: (props) => ({
      ...theme.components.Button.variants?.solid,
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
    ...theme.components.Button.defaultProps,
    variant: '_solid',
  },
};
