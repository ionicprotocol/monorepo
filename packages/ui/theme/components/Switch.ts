import { switchAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  switchAnatomy.keys
);

const baseStyle = definePartsStyle({
  container: {
    // ...
  },
  thumb: {
    bg: 'iWhite',
  },
  track: {
    _checked: {
      bg: 'iGreen',
    },
    bg: 'iGray',
  },
});

export const SwitchConfigStyle = defineMultiStyleConfig({ baseStyle });
