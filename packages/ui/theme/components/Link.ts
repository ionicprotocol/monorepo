import { theme } from '@chakra-ui/react';
import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const LinkStyleConfig: ComponentStyleConfig = {
  ...theme.components.Link,
  variants: {
    ...theme.components.Link.variants,
    color: (props) => ({
      color: mode('ecru', 'ecru')(props),
      textDecoration: 'underline',
    }),
  },
  defaultProps: {},
};
