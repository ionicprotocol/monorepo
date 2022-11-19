import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { cssVar, mode } from '@chakra-ui/theme-tools';
const $arrowBg = cssVar('popper-arrow-bg');

export const PopoverStyleConfig: ComponentStyleConfig = {
  parts: ['popper', 'content', 'arrow'],
  baseStyle: (props) => ({
    popper: {
      borderRadius: 0,
    },
    content: {
      [$arrowBg.variable]: mode('#F6F4F1', '#282828')(props),
      borderRadius: 'sm',
      backgroundColor: mode('whiteBg', 'raisinBlack')(props),
      borderWidth: 1,
      borderColor: mode('ecru', 'ecru')(props),
    },
    arrow: {
      borderWidth: 0,
    },
  }),
  sizes: {},
  defaultProps: { p: 2 },
};
