import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const LinkStyleConfig: ComponentStyleConfig = {
  variants: {
    color: (props) => ({
      color: mode('ecru', 'ecru')(props),
      textDecoration: 'underline',
    }),
  },
  defaultProps: {},
};
