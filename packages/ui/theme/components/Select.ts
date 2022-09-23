import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const SelectConfigStyle: ComponentStyleConfig = {
  parts: ['field', 'icon'],
  variants: {
    outline: (props) => ({
      field: {
        borderColor: 'ecru',
        borderRadius: 'xl',
        color: mode('raisinBlack', 'white')(props),
        backgroundColor: mode('whiteBg', 'raisinBlack')(props),
        borderWidth: '2px',
        fontSize: '16px',
        _hover: {
          borderColor: 'ecru',
          backgroundColor: mode('silverMetallic30', 'ecru30')(props),
        },
        _focus: {
          borderColor: 'ecru',
          outline: 'none',
        },
        cursor: 'pointer',
        boxShadow: 'none !important',
      },
      icon: {
        color: mode('ecru', 'ecru')(props),
      },
    }),
  },
  defaultProps: {
    variant: 'outline',
  },
};
