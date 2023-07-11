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
          borderColor: mode('iSeparator', 'iSeparator')(props),
          outline: 'none',
        },
        _hover: {
          backgroundColor: 'none',
        },
        backgroundColor: 'none',
        borderColor: mode('iSeparator', 'iSeparator')(props),
        borderRadius: '14px',
        borderWidth: '2px',
        boxShadow: 'none !important',
        color: mode('iWhite', 'iWhite')(props),
        cursor: 'pointer',
        fontSize: '14px',
      },
      icon: {
        color: mode('iWhite', 'iWhite')(props),
      },
    }),
  },
};
