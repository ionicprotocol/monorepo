import { progressAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';
import { mode } from '@chakra-ui/theme-tools';

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle((props) => ({
  filledTrack: { bg: mode('iGreen', 'iGreen')(props) },
  label: {
    color: mode('iWhite', 'iWhite')(props),
    fontSize: { base: '12px' },
    fontWeight: 500,
    lineHeight: { base: '18px' },
    textTransform: 'uppercase'
  },
  track: {
    bg: mode('iGray', 'iGray')(props)
  }
}));

const sizes = {
  lg: definePartsStyle({
    track: { h: '100px' }
  }),
  md: definePartsStyle({
    track: { h: '74px' }
  }),
  sm: definePartsStyle({
    track: { h: '52px' }
  }),
  xs: definePartsStyle({
    track: { h: '30px' }
  })
};

const green = definePartsStyle((props) => {
  return {
    filledTrack: { bg: mode('iGreen', 'iGreen')(props) },
    label: {
      color: mode('iWhite', 'iWhite')(props),
      fontSize: { base: '12px' },
      fontWeight: 500,
      lineHeight: { base: '18px' },
      textTransform: 'uppercase'
    },
    track: {
      bg: mode('iGray', 'iGray')(props)
    }
  };
});

export const ProgressStyleConfig = defineMultiStyleConfig({
  baseStyle,
  defaultProps: {
    size: 'md',
    variant: 'green'
  },
  sizes,
  variants: { green }
});
