import { cssVar } from '@chakra-ui/react';
import type { ComponentStyleConfig } from '@chakra-ui/theme';

const $arrowBg = cssVar('popper-arrow-bg');
export const TooltipStyleConfig: ComponentStyleConfig = {
  baseStyle: ({ colorMode }) => ({
    bg: colorMode === 'light' ? 'iBlack' : 'iBlack',
    borderColor: 'iSeparator',
    borderWidth: '1px',
    color: colorMode === 'light' ? 'iWhite' : 'iWhite',
    textAlign: 'center',
    [$arrowBg.variable]: colorMode === 'light' ? 'iBlack' : 'iBlack',
  }),
  defaultProps: {
    p: 2,
    zIndex: 999999999,
  },
};
