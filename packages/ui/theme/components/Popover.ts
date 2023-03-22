import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { cssVar, mode } from '@chakra-ui/theme-tools';
const $arrowBg = cssVar('popper-arrow-bg');

export const PopoverStyleConfig: ComponentStyleConfig = {
  baseStyle: (props) => ({
    arrow: {
      borderWidth: 0,
    },
    content: {
      [$arrowBg.variable]: mode('#F6F4F1', '#282828')(props),
      backgroundColor: mode('whiteBg', 'raisinBlack')(props),
      borderColor: mode('ecru', 'ecru')(props),
      borderRadius: 'sm',
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
