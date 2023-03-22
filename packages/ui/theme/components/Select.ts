import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const SelectConfigStyle: ComponentStyleConfig = {
  defaultProps: {
    variant: 'outline',
  },
  parts: ['field', 'icon'],
  variants: {
    outline: (props) => ({
      field: {
        _focus: {
          borderColor: 'ecru',
          outline: 'none',
        },
        _hover: {
          backgroundColor: mode('silverMetallic30', 'ecru30')(props),
          borderColor: 'ecru',
        },
        backgroundColor: mode('whiteBg', 'raisinBlack')(props),
        borderColor: 'ecru',
        borderRadius: 'xl',
        borderWidth: '2px',
        boxShadow: 'none !important',
        color: mode('raisinBlack', 'white')(props),
        cursor: 'pointer',
        fontSize: '16px',
      },
      icon: {
        color: mode('ecru', 'ecru')(props),
      },
    }),
  },
};
