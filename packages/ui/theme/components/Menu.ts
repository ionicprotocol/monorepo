import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const MenuStyleConfig: ComponentStyleConfig = {
  baseStyle: (props) => ({
    button: {},
    command: {
      fontFamily: 'mono',
      fontSize: 'sm',
      letterSpacing: 'tighter',
      opacity: '0.8',
      pl: '4'
    },
    divider: {
      borderColor: mode('silverMetallic50', 'ecru30')(props),
      my: 2
    },
    groupTitle: {
      color: mode('raisinBlack', 'whiteBg')(props),
      fontWeight: 'bold',
      textAlign: 'center'
    },
    item: {
      _focus: {
        bg: mode('silverMetallic30', 'ecru30')(props)
      },
      _hover: {
        bg: mode('silverMetallic20', 'ecru20')(props)
      },
      color: mode('raisinBlack', 'whiteBg')(props)
    },
    list: {
      backgroundColor: mode('whiteBg', 'raisinBlack')(props),
      borderColor: mode('silverMetallic50', 'ecru30')(props),
      borderRadius: 'md',
      borderWidth: 1,
      pt: '4'
    }
  }),
  parts: ['button', 'list', 'item', 'groupTitle', 'command', 'divider']
};
