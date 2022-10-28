import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const MenuStyleConfig: ComponentStyleConfig = {
  parts: ['button', 'list', 'item', 'groupTitle', 'command', 'divider'],
  baseStyle: (props) => ({
    button: {},
    list: {
      pt: '4',
      borderRadius: 'md',
      borderWidth: 1,
      borderColor: mode('silverMetallic50', 'ecru30')(props),
      backgroundColor: mode('whiteBg', 'raisinBlack')(props),
    },
    item: {
      color: mode('raisinBlack', 'whiteBg')(props),
      _hover: {
        bg: mode('silverMetallic20', 'ecru20')(props),
      },
      _focus: {
        bg: mode('silverMetallic30', 'ecru30')(props),
      },
    },
    groupTitle: {
      color: mode('raisinBlack', 'whiteBg')(props),
      textAlign: 'center',
      fontWeight: 'bold',
    },
    command: {
      opacity: '0.8',
      fontFamily: 'mono',
      fontSize: 'sm',
      letterSpacing: 'tighter',
      pl: '4',
    },
    divider: {
      my: 2,
      borderColor: mode('silverMetallic50', 'ecru30')(props),
    },
  }),
};
