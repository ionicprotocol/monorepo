import { theme } from '@chakra-ui/react';
import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const SwitchConfigStyle: ComponentStyleConfig = {
  ...theme.components.Switch,
  baseStyle: (props) => ({
    ...theme.components.Switch.baseStyle,
    container: {},
    track: {
      _checked: {
        backgroundColor: mode('ecru', 'ecru')(props),
      },
    },
    thumb: {
      backgroundColor: mode('whiteBg', 'whiteBg')(props),
    },
  }),
};
