import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const CheckboxStyleConfig: ComponentStyleConfig = {
  baseStyle: (props) => ({
    container: {},
    control: {
      _checked: {
        _hover: {
          bg: 'ecru',
          borderColor: 'ecru',
          color: mode('whiteBg', 'raisinBlack')(props),
        },
        bg: 'ecru',
        borderColor: 'ecru',
        color: mode('whiteBg', 'raisinBlack')(props),
      },
      _hover: {
        bg: mode('silverMetallic30', 'ecru30')(props),
        color: mode('whiteBg', 'raisinBlack')(props),
      },
      _indeterminate: {
        bg: 'ecru',
        color: mode('whiteBg', 'raisinBlack')(props),
      },
      borderColor: 'ecru',
      boxShadow: 'none',
      outline: 'none',
    },
    icon: {},
    label: {
      color: mode('raisinBlack', 'whiteBg')(props),
      pt: '2px',
    },
  }),
  parts: ['icon', 'container', 'control', 'label'],
};
