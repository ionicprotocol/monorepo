import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const StatStyleConfig: ComponentStyleConfig = {
  parts: ['container', 'label', 'helpText', 'number', 'icon'],
  baseStyle: (props) => ({
    container: {
      borderRadius: 'xl',
      backgroundColor: mode('whiteBg', 'raisinBlack')(props),
    },
  }),
  sizes: {
    lg: {
      label: {
        fontSize: 'lg',
      },
      number: {
        fontSize: '2xl',
        fontWeight: 'bold',
      },
      helpText: {
        fontSize: 'lg',
      },
    },
  },
  defaultProps: {
    size: 'lg',
  },
};
