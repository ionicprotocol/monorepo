import { sliderAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle({
  filledTrack: {
    bg: 'iGreen',
  },
  thumb: {
    bg: 'iWhite',
  },
});

const sizes = {
  xl: definePartsStyle({
    container: defineStyle({
      w: '50%',
    }),
    thumb: defineStyle({
      boxSize: 7,
    }),
    track: defineStyle({
      h: 7,
    }),
  }),
};

const health = definePartsStyle((props) => {
  return {
    container: defineStyle({
      rounded: 'none',
    }),
    filledTrack: defineStyle({
      opacity: 0,
    }),
    mark: defineStyle({}),
    thumb: defineStyle({
      _focus: {
        boxShadow: '0px 0px 0px 3px #F0F0F055',
      },
      bg: mode('iWhite', 'iWhite')(props),
      boxShadow: '0px 0px 0px 3px #F0F0F055',
      height: '9px',
      width: '9px',
    }),
    track: defineStyle({ bgGradient: 'linear(to-r, iRed, iYellow, iGreen)', height: '4px' }),
  };
});

const green = definePartsStyle((props) => {
  return {
    container: defineStyle({
      rounded: '100px',
    }),
    filledTrack: defineStyle({ bg: 'iGreen', height: '4px' }),
    mark: defineStyle({}),
    thumb: defineStyle({
      _focus: {
        boxShadow: '0px 0px 0px 3px #F0F0F055',
      },
      bg: mode('iWhite', 'iWhite')(props),
      boxShadow: '0px 0px 0px 3px #F0F0F055',
      height: '9px',
      width: '9px',
    }),
    track: defineStyle({ bg: 'iGreen50', height: '4px' }),
  };
});

const yellow = definePartsStyle((props) => {
  return {
    container: defineStyle({
      rounded: '100px',
    }),
    filledTrack: defineStyle({ bg: 'iYellow', height: '4px' }),
    mark: defineStyle({}),
    thumb: defineStyle({
      _focus: {
        boxShadow: 'none',
      },
      bg: mode('iYellow', 'iYellow')(props),
      borderRadius: 'none',
      boxShadow: 'none',
      height: '14px',
      width: '2px',
    }),
    track: defineStyle({ bg: 'iYellow50', height: '4px' }),
  };
});

const red = definePartsStyle((props) => {
  return {
    container: defineStyle({
      rounded: '100px',
    }),
    filledTrack: defineStyle({ height: '4px', opacity: 0 }),
    mark: defineStyle({}),
    thumb: defineStyle({
      _focus: {
        boxShadow: 'none',
      },
      bg: mode('iRed', 'iRed')(props),
      borderRadius: 'none',
      boxShadow: 'none',
      height: '14px',
      width: '2px',
    }),
    track: defineStyle({ bg: 'iGray', height: '4px' }),
  };
});

export const SliderConfigStyle = defineMultiStyleConfig({
  baseStyle,
  defaultProps: {},
  sizes,
  variants: { green, health, red, yellow },
});
