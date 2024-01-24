import { switchAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  switchAnatomy.keys
);

const baseStyle = definePartsStyle({
  container: {
    minHeight: { base: '20px' },
    p: { base: 0 }
  },
  thumb: {
    minHeight: { base: '16px' },
    minWidth: { base: '16px' }
  },
  track: {
    minHeight: { base: '16px' },
    minWidth: { base: '32px' }
  }
});

const ghost = definePartsStyle((props) => {
  return {
    container: {},
    thumb: {
      _checked: {
        bg: mode('iBlack', 'iBlack')(props)
      },
      bg: mode('iWhite', 'iWhite')(props)
    },
    track: {
      _checked: {
        bg: mode('iGreen', 'iGreen')(props)
      },
      bg: mode('iGray', 'iGray')(props)
    }
  };
});

export const SwitchConfigStyle = defineMultiStyleConfig({
  baseStyle,
  defaultProps: {
    variant: 'ghost'
  },
  variants: { ghost }
});
