import { defineStyle, defineStyleConfig } from '@chakra-ui/react';
import { cssVar, mode } from '@chakra-ui/theme-tools';
const $arrowBg = cssVar('popper-arrow-bg');

// define the base component styles
const baseStyle = defineStyle((props) => {
  return {
    bg: mode('iBlack', 'iBlack')(props),
    borderColor: mode('iSeparator', 'iSeparator')(props),
    borderRadius: '10px',
    borderWidth: '1px',
    color: mode('light', 'light')(props),
    textAlign: 'center',
    [$arrowBg.variable]: mode('iBlack', 'iBlack')(props)
    // zIndex: 999999999,
  };
});

// define custom sizes
const sizes = {
  lg: defineStyle({
    fontSize: 'lg',
    maxW: '350px',
    px: '4',
    py: '2'
  }),
  md: defineStyle({
    fontSize: 'md',
    maxW: '300px',
    px: '3',
    py: '2'
  }),
  sm: defineStyle({
    fontSize: 'sm',
    maxW: '200px',
    px: '2',
    py: '1'
  })
};

// define styles for custom variant
const colorfulVariant = defineStyle((props) => {
  return {
    bg: mode('iWhite', 'iBlack')(props)
  };
});

// define custom variants
const variants = {
  colorful: colorfulVariant
};

const defaultProps = {};

// export the component theme
export const TooltipStyleConfig = defineStyleConfig({ baseStyle, defaultProps, sizes, variants });
