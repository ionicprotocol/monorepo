import { theme } from '@chakra-ui/react';
import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const ButtonStyleConfig: ComponentStyleConfig = {
  ...theme.components.Button,
  baseStyle: {
    ...theme.components.Button.baseStyle,
    alignItems: 'center',
    borderRadius: 'xl',
    display: 'inline-flex',
    fontFamily: 'heading',
    fontWeight: 'bold',
    justifyContent: 'center',
  },
  defaultProps: {
    ...theme.components.Button.defaultProps,
    variant: '_solid',
  },
  variants: {
    ...theme.components.Button.variants,
    _ghost: (props) => ({
      ...theme.components.Button.variants?.ghost,
      _hover: {
        bg: mode('iPageBg', 'iPageBg')(props),
        color: mode('iWhite', 'white')(props),
        textDecoration: 'unset',
      },
      height: 6,
    }),
    _link: (props) => ({
      ...theme.components.Button.variants?.link,
      _hover: {
        color: mode('ecru', 'ecru')(props),
      },
      color: mode('raisinBlack', 'whiteBg')(props),
    }),
    _outline: (props) => ({
      ...theme.components.Button.variants?.outline,
      _hover: {
        bg: mode('ecru', 'ecru')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
        textDecoration: 'unset',
      },
      bg: mode('whiteBg', 'raisinBlack')(props),
      borderColor: mode('ecru', 'ecru')(props),
      borderWidth: 2,
      color: mode('raisinBlack', 'ecru')(props),
    }),
    _solid: (props) => ({
      ...theme.components.Button.variants?.solid,
      _active: { opacity: 0.8 },
      _hover: {
        _disabled: {
          bg: mode('ecru', 'ecru')(props),
          color: mode('raisinBlack', 'raisinBlack')(props),
        },
        bg: mode('ecru80', 'ecru80')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
      },
      bg: mode('ecru', 'ecru')(props),
      color: mode('raisinBlack', 'raisinBlack')(props),
    }),
    external: (props) => ({
      ...theme.components.Button.variants?.solid,
      _hover: {
        bg: mode('bone', 'raisinBlack80')(props),
        color: mode('raisinBlack', 'bone')(props),
      },
      bg: mode('whiteBg', 'raisinBlack')(props),
      borderRadius: 'md',
      color: mode('raisinBlack', 'bone')(props),
    }),
    filter: (props) => ({
      ...theme.components.Button.variants?.solid,
      _active: { opacity: 0.8 },
      _hover: {
        bg: props.isSelected
          ? mode(
              props.color ? `${props.color}.600` : 'ecru80alpha',
              props.color ? `${props.color}.300` : 'ecru80alpha'
            )(props)
          : mode(
              props.color ? `${props.color}.600Alpha200` : 'ecru80alpha',
              props.color ? `${props.color}.200Alpha200` : 'ecru80alpha'
            )(props),
        borderColor: mode(
          props.color ? `${props.color}.500` : 'ecru',
          props.color ? `${props.color}.200` : 'ecru'
        )(props),
        color: props.isSelected
          ? mode('whiteBg', 'raisinBlack')(props)
          : mode(
              props.color ? `${props.color}.600` : 'raisinBlack',
              props.color ? `${props.color}.200` : 'raisinBlack'
            )(props),
      },
      bg: props.isSelected
        ? mode(
            props.color ? `${props.color}.600` : 'ecru',
            props.color ? `${props.color}.200` : 'ecru'
          )(props)
        : mode('whiteBg', 'raisinBlack')(props),
      borderColor: mode(
        props.color ? `${props.color}.600` : 'ecru',
        props.color ? `${props.color}.200` : 'ecru'
      )(props),
      borderWidth: 2,
      color: props.isSelected
        ? mode(props.color ? 'whiteBg' : 'raisinBlack', 'raisinBlack')(props)
        : mode(
            props.color ? `${props.color}.600` : 'gunmetal',
            props.color ? `${props.color}.200` : 'ecru'
          )(props),
      height: '52px',
      mr: '-px',
    }),
    listed: (props) => ({
      ...theme.components.Button.variants?.solid,
      _active: {
        bg: mode('silverMetallic80', 'ecru80')(props),
      },
      _hover: {
        bg: mode('silverMetallic30', 'ecru30')(props),
      },
      bg: mode('whiteBg', 'raisinBlack')(props),
      color: mode('raisinBlack', 'whiteBg')(props),
    }),
    panelLink: (props) => ({
      ...theme.components.Button.variants?.link,
      _hover: {
        color: mode('ecru', 'ecru')(props),
      },
      color: mode('whiteBg', 'raisinBlack')(props),
    }),
    silver: (props) => ({
      ...theme.components.Button.variants?.solid,
      _active: { opacity: 0.8 },
      _hover: {
        bg: mode('silverMetallic80', 'silverMetallic80')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
      },
      bg: mode('silverMetallic', 'silverMetallic')(props),
      color: mode('raisinBlack', 'raisinBlack')(props),
    }),
  },
};
