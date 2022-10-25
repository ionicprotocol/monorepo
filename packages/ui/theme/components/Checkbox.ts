import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const CheckboxStyleConfig: ComponentStyleConfig = {
  parts: ['icon', 'container', 'control', 'label'],
  baseStyle: (props) => ({
    icon: {},
    container: {},
    control: {
      outline: 'none',
      boxShadow: 'none',
      borderColor: 'ecru',
      _checked: {
        bg: 'ecru',
        borderColor: 'ecru',
        color: mode('whiteBg', 'raisinBlack')(props),
        _hover: {
          bg: 'ecru',
          borderColor: 'ecru',
          color: mode('whiteBg', 'raisinBlack')(props),
        },
      },
      _hover: {
        bg: mode('silverMetallic30', 'ecru30')(props),
        color: mode('whiteBg', 'raisinBlack')(props),
      },
      _indeterminate: {
        bg: 'ecru',
        color: mode('whiteBg', 'raisinBlack')(props),
      },
    },
    label: {
      color: mode('raisinBlack', 'whiteBg')(props),
      pt: '2px',
    },
  }),
};
