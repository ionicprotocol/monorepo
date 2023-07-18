import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const DividierStyleConfig: ComponentStyleConfig = {
  defaultProps: {
    variant: 'normal'
  },
  variants: {
    normal: (props) => ({
      bgColor: mode('silverMetallic50', 'ecru20')(props),
      borderWidth: 0,
      height: '1px',
      width: '100%'
    })
  }
};
