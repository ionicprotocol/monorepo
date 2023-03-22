import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const StatStyleConfig: ComponentStyleConfig = {
  baseStyle: (props) => ({
    container: {
      backgroundColor: mode('whiteBg', 'raisinBlack')(props),
      borderRadius: 'xl',
    },
  }),
  defaultProps: {
    size: 'lg',
  },
  parts: ['container', 'label', 'helpText', 'number', 'icon'],
  sizes: {
    lg: {
      helpText: {
        fontSize: 'lg',
      },
      label: {
        fontSize: 'lg',
      },
      number: {
        fontSize: '2xl',
        fontWeight: 'bold',
      },
    },
  },
};
