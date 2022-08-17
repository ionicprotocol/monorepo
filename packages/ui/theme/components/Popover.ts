import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const PopoverStyleConfig: ComponentStyleConfig = {
  parts: ['popper', 'content', 'arrow'],
  baseStyle: (props) => ({
    popper: {
      borderRadius: 0,
    },
    content: {
      borderRadius: 8,
      backgroundColor: mode('whiteBg', 'raisinBlack')(props),
      borderWidth: 1,
      borderColor: mode('ecru', 'ecru')(props),
    },
    arrow: {
      backgroundColor: mode('whiteBg', 'raisinBlack')(props),
      borderWidth: 1,
      borderColor: mode('ecru', 'ecru')(props),
    },
  }),
  sizes: {},
  defaultProps: { p: 2 },
};
