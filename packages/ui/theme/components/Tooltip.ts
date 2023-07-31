import { defineStyle, defineStyleConfig } from '@chakra-ui/react';
import { cssVar, mode } from '@chakra-ui/theme-tools';
const $arrowBg = cssVar('popper-arrow-bg');

// define the base component styles
const baseStyle = defineStyle((props) => {
  return {
    bg: mode('iBlack', 'iBlack')(props),
    borderColor: mode('iSeparator', 'iSeparator')(props),
    borderWidth: '1px',
    color: mode('iWhite', 'iWhite')(props),
    textAlign: 'center',
    [$arrowBg.variable]: mode('iBlack', 'iBlack')(props)
    // zIndex: 999999999,
  };
});

// define custom sizes
const sizes = {
  lg: defineStyle({
    borderRadius: '10px',
    fontSize: 'lg',
    maxW: '350px',
    px: '4',
    py: '2'
  }),
  md: defineStyle({
    borderRadius: '8px',
    fontSize: 'md',
    maxW: '300px',
    px: '3',
    py: '2'
  }),
  sm: defineStyle({
    borderRadius: '6px',
    fontSize: 'sm',
    maxW: '200px',
    px: '2',
    py: '1'
  })
};

// define styles for custom variant
const colorfulVariant = defineStyle((props) => {
  return {
    bg: mode('iBlack', 'iBlack')(props)
  };
});

// define custom variants
const variants = {
  colorful: colorfulVariant
};

// export the component theme
export const TooltipStyleConfig = defineStyleConfig({
  baseStyle,
  defaultProps: { size: 'sm' },
  sizes,
  variants
});
