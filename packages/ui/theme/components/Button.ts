import { defineStyle, defineStyleConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const baseStyle = defineStyle({
  _disabled: {
    boxShadow: 'none',
    cursor: 'not-allowed',
    opacity: 0.4
  },
  _focusVisible: {
    boxShadow: 'outline'
  },
  _hover: {
    _disabled: {
      bg: 'initial'
    }
  },
  borderRadius: 'md',
  fontSize: { base: '14px' },
  fontWeight: 600,
  lineHeight: { base: '24px' },
  transitionDuration: 'normal',
  transitionProperty: 'common'
});

const ghost = defineStyle({
  _focus: {
    bg: 'none',
    color: 'none'
  },
  _hover: {
    bg: 'none',
    color: 'none',
    textDecoration: 'unset'
  },
  color: 'inherit',
  height: 'fit-content',
  p: 0
});

const green = defineStyle((props) => {
  return {
    _disabled: {
      bg: mode('iGray', 'iGray')(props)
    },
    _focus: {
      bg: mode('iGreen', 'iGreen')(props),
      color: mode('iCardBg', 'iCardBg')(props)
    },
    _hover: {
      _disabled: {
        bg: mode('iGray', 'iGray')(props),
        color: mode('iCardBg', 'iCardBg')(props)
      },
      bg: mode('iGreen', 'iGreen')(props),
      color: mode('iCardBg', 'iCardBg')(props),
      textDecoration: 'unset'
    },
    bg: mode('iGreen', 'iGreen')(props),
    borderRadius: { base: '12px' },
    color: mode('iCardBg', 'iCardBg')(props),
    height: { base: '40px' },
    px: { base: '12px' },
    py: { base: '8px' }
  };
});

const disabled = defineStyle((props) => {
  return {
    _disabled: {
      bg: mode('iGray', 'iGray')(props)
    },
    _focus: {
      bg: mode('iGray', 'iGray')(props),
      color: mode('iBlack', 'iBlack')(props)
    },
    _hover: {
      _disabled: {
        bg: mode('iGray', 'iGray')(props),
        color: mode('iBlack', 'iBlack')(props)
      },
      bg: mode('iGray', 'iGray')(props),
      color: mode('iBlack', 'iBlack')(props),
      textDecoration: 'unset'
    },
    bg: mode('iGray', 'iGray')(props),
    borderRadius: { base: '12px' },
    color: mode('iBlack', 'iBlack')(props),
    height: { base: '40px' },
    px: { base: '12px' },
    py: { base: '8px' }
  };
});

const outline = defineStyle((props) => {
  return {
    _focus: {
      bg: 'none',
      color: mode('iLightGray', 'iLightGray')(props)
    },
    _hover: {
      bg: 'none',
      color: mode('iLightGray', 'iLightGray')(props),
      textDecoration: 'unset'
    },
    bg: 'none',
    borderColor: mode('iLightGray', 'iLightGray')(props),
    borderRadius: { base: '12px' },
    color: mode('iLightGray', 'iLightGray')(props),
    height: { base: '40px' },
    px: { base: '12px' },
    py: { base: '8px' }
  };
});

const _filter = defineStyle((props) => {
  return {
    _active: { bg: mode('iCardBg', 'iCardBg')(props) },
    bg: props.isSelected ? mode('iCardBg', 'iCardBg')(props) : mode('iRowBg', 'iRowBg')(props),
    color: props.isSelected
      ? mode('iGreen', 'iGreen')(props)
      : mode('iLightGray', 'iLightGray')(props),
    height: '36px',
    minW: '40px',
    mr: '-px'
  };
});

export const ButtonStyleConfig = defineStyleConfig({
  baseStyle,
  defaultProps: {
    size: 'sm',
    variant: 'ghost'
  },
  variants: { _filter, disabled, ghost, green, outline }
});
