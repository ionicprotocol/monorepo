import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const TabsStyleConfig: ComponentStyleConfig = {
  parts: ['root', 'tab', 'tablist', 'tabpanel', 'tabpanels'],
  baseStyle: {
    tab: {},
    tablist: {},
    tabpanel: {},
  },
  variants: {
    line: (props) => ({
      tab: {
        color: mode('whiteBg', 'raisinBlack')(props),
        borderBottomWidth: 2,
      },
      tablist: {
        borderBottomWidth: 0,
      },
    }),
  },
  sizes: {},
  defaultProps: {},
};
