import { defineStyle, defineStyleConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const baseStyle = defineStyle({
  _disabled: {
    boxShadow: 'none',
    cursor: 'not-allowed',
    opacity: 0.4,
  },
  _focusVisible: {
    boxShadow: 'outline',
  },
  _hover: {
    _disabled: {
      bg: 'initial',
    },
  },
  borderRadius: 'md',
  fontWeight: 'semibold',
  lineHeight: '1.2',
  transitionDuration: 'normal',
  transitionProperty: 'common',
});

const outline = defineStyle({
  border: '2px dashed', // change the appearance of the border
  borderRadius: 0, // remove the border radius
  fontWeight: 'semibold', // change the font weight
});

const ghost = defineStyle({
  _focus: {
    bg: 'none',
    color: 'none',
  },
  _hover: {
    bg: 'none',
    color: 'none',
    textDecoration: 'unset',
  },
  height: 6,
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
    mr: '-px',
  };
});

export const ButtonStyleConfig = defineStyleConfig({
  baseStyle,
  defaultProps: {
    size: 'sm',
    variant: 'ghost',
  },
  variants: { _filter, ghost, outline },
});
