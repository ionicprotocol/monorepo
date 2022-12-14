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
    _ghost: (props) => ({
      ...theme.components.Button.variants?.ghost,
      _hover: {
        textDecoration: 'unset',
        bg: mode('ecru', 'ecru')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
      },
    }),
    _solid: (props) => ({
      ...theme.components.Button.variants?.solid,
      bg: mode('ecru', 'ecru')(props),
      color: mode('raisinBlack', 'raisinBlack')(props),
      _hover: {
        bg: mode('ecru80', 'ecru80')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
        _disabled: {
          bg: mode('ecru', 'ecru')(props),
          color: mode('raisinBlack', 'raisinBlack')(props),
        },
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
        textDecoration: 'unset',
        bg: mode('ecru', 'ecru')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
      },
    }),
    filter: (props) => ({
      ...theme.components.Button.variants?.solid,
      height: '52px',
      bg: props.isSelected
        ? mode(
            props.color ? `${props.color}.600` : 'ecru',
            props.color ? `${props.color}.200` : 'ecru'
          )(props)
        : mode('whiteBg', 'raisinBlack')(props),
      color: props.isSelected
        ? mode(props.color ? 'whiteBg' : 'raisinBlack', 'raisinBlack')(props)
        : mode(
            props.color ? `${props.color}.600` : 'gunmetal',
            props.color ? `${props.color}.200` : 'ecru'
          )(props),
      borderWidth: 2,
      borderColor: mode(
        props.color ? `${props.color}.600` : 'ecru',
        props.color ? `${props.color}.200` : 'ecru'
      )(props),
      mr: '-px',
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
        color: props.isSelected
          ? mode('whiteBg', 'raisinBlack')(props)
          : mode(
              props.color ? `${props.color}.600` : 'raisinBlack',
              props.color ? `${props.color}.200` : 'raisinBlack'
            )(props),
        borderColor: mode(
          props.color ? `${props.color}.500` : 'ecru',
          props.color ? `${props.color}.200` : 'ecru'
        )(props),
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
      color: mode('whiteBg', 'raisinBlack')(props),
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
    external: (props) => ({
      ...theme.components.Button.variants?.solid,
      bg: mode('whiteBg', 'raisinBlack')(props),
      color: mode('raisinBlack', 'bone')(props),
      borderRadius: 'md',
      _hover: {
        bg: mode('bone', 'raisinBlack80')(props),
        color: mode('raisinBlack', 'bone')(props),
      },
    }),
  },
  defaultProps: {
    ...theme.components.Button.defaultProps,
    variant: '_solid',
  },
};
