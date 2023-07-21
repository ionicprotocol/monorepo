import { avatarAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  avatarAnatomy.keys
);

const baseStyle = definePartsStyle({
  container: {
    bg: 'transparent',
    borderColor: 'transparent',
    color: (props) => mode('raisinBlack', 'raisinBlack')(props)
  },
  excessLabel: {
    bg: 'ecru',
    color: 'rasinBlack'
  }
});

export const AvatarStyleConfig = defineMultiStyleConfig({ baseStyle });
