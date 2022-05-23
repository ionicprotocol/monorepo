import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const ModalStyleConfig: ComponentStyleConfig = {
  parts: ['dialog', 'header'],
  baseStyle: (props) => ({
    dialog: {
      borderRadius: 'xl',
      backgroundColor: mode('whiteBg', 'raisinBlack')(props),
      borderWidth: 2,
      borderColor: mode('ecru', 'ecru')(props),
    },
    header: {
      fontSize: '2xl',
      textAlign: 'left',
    },
  }),
  sizes: {},
  defaultProps: {
    size: 'lg',
    motionPreset: 'slideInBottom',
  },
};
