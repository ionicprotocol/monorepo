import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const CheckboxStyleConfig: ComponentStyleConfig = {
  baseStyle: (props) => ({
    container: {},
    control: {
      _checked: {
        _hover: {
          bg: 'iSeparator',
          borderColor: 'iSeparator',
          color: mode('iWhite', 'iBlack')(props)
        },
        bg: 'iSeparator',
        borderColor: 'iSeparator',
        color: mode('iWhite', 'iBlack')(props)
      },
      _hover: {
        bg: mode('silverMetallic30', 'iSeparator')(props),
        color: mode('iWhite', 'iBlack')(props)
      },
      _indeterminate: {
        bg: 'iSeparator',
        color: mode('iWhite', 'iBlack')(props)
      },
      borderColor: 'iSeparator',
      boxShadow: 'none',
      outline: 'none'
    },
    icon: {},
    label: {
      color: mode('iBlack', 'iWhite')(props),
      pt: '2px'
    }
  }),
  parts: ['icon', 'container', 'control', 'label']
};
