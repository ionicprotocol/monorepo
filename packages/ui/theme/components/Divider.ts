import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const DividierStyleConfig: ComponentStyleConfig = {
  variants: {
    normal: (props) => ({
      borderWidth: 0,
      height: '1px',
      width: '100%',
      bgColor: mode('silverMetallic50', 'ecru20')(props),
    }),
  },
  defaultProps: {
    variant: 'normal',
  },
};
