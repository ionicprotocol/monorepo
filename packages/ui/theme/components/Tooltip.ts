import { cssVar } from '@chakra-ui/react';
import type { ComponentStyleConfig } from '@chakra-ui/theme';

const $arrowBg = cssVar('popper-arrow-bg');
export const TooltipStyleConfig: ComponentStyleConfig = {
  baseStyle: ({ colorMode }) => ({
    bg: colorMode === 'light' ? 'whiteBg' : 'raisinBlack',
    borderColor: 'ecru',
    borderWidth: '1px',
    color: colorMode === 'light' ? 'raisinBlack' : 'whiteBg',
    textAlign: 'center',
    [$arrowBg.variable]: colorMode === 'light' ? 'whiteBg' : 'raisinBlack',
  }),
  defaultProps: {
    p: 2,
    zIndex: 999999999,
  },
};
