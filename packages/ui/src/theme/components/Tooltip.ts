import { cssVar } from '@chakra-ui/react';
import type { ComponentStyleConfig } from '@chakra-ui/theme';

const $arrowBg = cssVar('popper-arrow-bg');
export const TooltipStyleConfig: ComponentStyleConfig = {
  baseStyle: ({ colorMode }) => ({
    bg: colorMode === 'light' ? 'whiteBg' : 'raisinBlack',
    color: colorMode === 'light' ? 'raisinBlack' : 'whiteBg',
    borderColor: 'ecru',
    borderWidth: '1px',
    textAlign: 'center',
    [$arrowBg.variable]: colorMode === 'light' ? 'whiteBg' : 'raisinBlack',
  }),
  defaultProps: {
    zIndex: 999999999,
    p: 2,
  },
};
