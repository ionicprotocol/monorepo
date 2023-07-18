import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const TabsStyleConfig: ComponentStyleConfig = {
  baseStyle: {
    tab: {},
    tablist: {},
    tabpanel: {}
  },
  defaultProps: {},
  parts: ['root', 'tab', 'tablist', 'tabpanel', 'tabpanels'],
  sizes: {},
  variants: {
    line: (props) => ({
      tab: {
        borderBottomWidth: 2,
        color: mode('whiteBg', 'raisinBlack')(props)
      },
      tablist: {
        borderBottomWidth: 0
      }
    })
  }
};
