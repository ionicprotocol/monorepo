import { defineStyle, defineStyleConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const baseStyle = defineStyle((props) => {
  return {
    '&[data-loading]': {
      color: mode('iGreen', 'iGreen')(props)
    },
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
    borderWidth: '1px',
    fontSize: { base: '14px' },
    fontWeight: 600,
    lineHeight: { base: '24px' },
    transitionDuration: 'normal',
    transitionProperty: 'common'
  };
});

const sizes = {
  lg: defineStyle({
    borderRadius: { base: '14px' },
    height: { base: '44px' },
    px: { base: '14px' },
    py: { base: '10px' }
  }),
  md: defineStyle({
    borderRadius: { base: '12px' },
    height: { base: '40px' },
    px: { base: '12px' },
    py: { base: '8px' }
  }),
  sm: defineStyle({
    borderRadius: { base: '10px' },
    height: { base: '36px' },
    px: { base: '10px' },
    py: { base: '6px' }
  }),
  xl: defineStyle({
    borderRadius: { base: '8px' },
    height: { base: '32px' },
    px: { base: '8px' },
    py: { base: '4px' }
  }),
  xs: defineStyle({
    borderRadius: { base: '6px' },
    height: { base: '28px' },
    px: { base: '6px' },
    py: { base: '2px' }
  })
};

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
  border: 'none',
  color: 'inherit',
  height: 'fit-content',
  p: 0
});

const solidGreen = defineStyle((props) => ({
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
  borderColor: mode('iGreen', 'iGreen')(props),
  color: mode('iCardBg', 'iCardBg')(props)
}));

const solidGray = defineStyle((props) => ({
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
  borderColor: mode('iGray', 'iGray')(props),
  color: mode('iBlack', 'iBlack')(props)
}));

const outlineLightGray = defineStyle((props) => {
  return {
    _focus: {
      bg: 'none',
      borderColor: mode('iLightGray', 'iLightGray')(props),
      color: mode('iLightGray', 'iLightGray')(props)
    },
    _hover: {
      bg: 'none',
      borderColor: mode('iLightGray', 'iLightGray')(props),
      color: mode('iLightGray', 'iLightGray')(props),
      textDecoration: 'unset'
    },
    bg: 'none',
    borderColor: mode('iLightGray', 'iLightGray')(props),
    color: mode('iLightGray', 'iLightGray')(props)
  };
});

const outlineRed = defineStyle((props) => {
  return {
    _focus: {
      bg: 'none',
      borderColor: mode('iRed', 'iRed')(props),
      color: mode('iRed', 'iRed')(props)
    },
    _hover: {
      bg: 'none',
      borderColor: mode('iRed', 'iRed')(props),
      color: mode('iRed', 'iRed')(props),
      textDecoration: 'unset'
    },
    bg: 'none',
    borderColor: mode('iRed', 'iRed')(props),
    color: mode('iRed', 'iRed')(props)
  };
});

const _filter = defineStyle((props) => {
  return {
    _active: { bg: mode('iCardBg', 'iCardBg')(props) },
    bg: props.isSelected ? mode('iCardBg', 'iCardBg')(props) : 'none',
    border: 'none',
    color: props.isSelected
      ? mode('iGreen', 'iGreen')(props)
      : mode('iLightGray', 'iLightGray')(props),
    minW: '40px',
    mr: '-px'
  };
});

export const ButtonStyleConfig = defineStyleConfig({
  baseStyle,
  defaultProps: {
    size: 'md',
    variant: 'ghost'
  },
  sizes,
  variants: { _filter, ghost, outlineLightGray, outlineRed, solidGray, solidGreen }
});
