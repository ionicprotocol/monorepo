import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { cssVar, mode } from '@chakra-ui/theme-tools';

const $arrowBg = cssVar('popper-arrow-bg');
export const TooltipStyleConfig: ComponentStyleConfig = {
  baseStyle: (props) => ({
    bg: mode('iBlack', 'iBlack')(props),
    borderColor: mode('iSeparator', 'iSeparator')(props),
    borderRadius: '10px',
    borderWidth: '1px',
    color: mode('light', 'light')(props),
    textAlign: 'center',
    [$arrowBg.variable]: mode('iBlack', 'iBlack')(props),
  }),
  defaultProps: {
    p: 2,
    zIndex: 999999999,
  },
};
