import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { cssVar, mode } from '@chakra-ui/theme-tools';
const $arrowBg = cssVar('popper-arrow-bg');

export const PopoverStyleConfig: ComponentStyleConfig = {
  baseStyle: (props) => ({
    arrow: {
      borderWidth: 0,
    },
    content: {
      [$arrowBg.variable]: mode('iBlack', 'iBlack')(props),
      backgroundColor: mode('iBlack', 'iBlack')(props),
      borderColor: mode('iSeparator', 'iSeparator')(props),
      borderRadius: '10px',
      borderWidth: 1,
    },
    popper: {
      borderRadius: 0,
    },
  }),
  defaultProps: { p: 2 },
  parts: ['popper', 'content', 'arrow'],
  sizes: {},
};
