import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const ModalStyleConfig: ComponentStyleConfig = {
  baseStyle: (props) => ({
    body: {},
    closeButton: {
      boxShadow: 'none',
      outline: 'none',
    },
    dialog: {
      backgroundColor: mode('whiteBg', 'raisinBlack')(props),
      borderColor: mode('ecru', 'ecru')(props),
      borderRadius: 'xl',
      borderWidth: 2,
    },
    header: {
      fontSize: {
        base: 18,
        lg: 24,
        md: 22,
        sm: 20,
      },
      textAlign: 'left',
    },
  }),
  defaultProps: {
    motionPreset: 'slideInBottom',
    size: 'lg',
  },
  parts: ['dialog', 'header', 'body', 'closeButton'],
  sizes: {},
};
