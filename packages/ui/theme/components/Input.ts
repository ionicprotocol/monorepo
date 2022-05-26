import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const InputConfigStyle: ComponentStyleConfig = {
  parts: ['field', 'element', 'addon'],
  variants: {
    outlineLeftAddon: (props) => ({
      element: {
        color: mode('raisinBlack', 'white')(props),
        fontSize: '16px',
        width: 'auto',
        pointerEvents: 'none',
      },
      field: {
        borderColor: 'ecru',
        borderRadius: 'xl',
        color: mode('raisinBlack', 'white')(props),
        backgroundColor: mode('whiteBg', 'raisinBlack')(props),
        borderWidth: '2px',
        fontSize: '16px',
        _hover: {
          borderColor: 'ecru',
        },
        _focus: {
          borderColor: 'ecru',
        },
        _placeholder: { color: mode('silverMetallic', 'white50')(props) },
        borderLeft: 'none',
        paddingLeft: 0,
      },
      addon: {
        backgroundColor: mode('whiteBg', 'raisinBlack')(props),
        pointerEvents: 'none',
        borderColor: 'ecru',
        borderRadius: 'xl',
        color: mode('raisinBlack', 'whiteBg')(props),
        borderWidth: '2px',
      },
    }),
    outlineRightAddon: (props) => ({
      element: {
        color: mode('raisinBlack', 'white')(props),
        fontSize: '16px',
        width: 'auto',
        pointerEvents: 'none',
      },
      field: {
        borderColor: 'ecru',
        borderRadius: 'xl',
        color: mode('raisinBlack', 'white')(props),
        backgroundColor: mode('whiteBg', 'raisinBlack')(props),
        borderWidth: '2px',
        fontSize: '16px',
        _hover: {
          borderColor: 'ecru',
        },
        _focus: {
          borderColor: 'ecru',
        },
        _placeholder: { color: mode('silverMetallic', 'white50')(props) },
        _readOnly: {
          borderColor: 'ecru30',
        },
      },
      addon: {
        backgroundColor: mode('whiteBg', 'raisinBlack')(props),
        pointerEvents: 'none',
        borderColor: 'ecru30',
        borderRadius: 'xl',
        color: mode('raisinBlack', 'whiteBg')(props),
        borderWidth: '2px',
      },
    }),
    outline: (props) => ({
      element: {
        color: mode('raisinBlack', 'white')(props),
        fontSize: '16px',
        width: 'auto',
        pointerEvents: 'none',
      },
      field: {
        borderColor: 'ecru',
        borderRadius: 'xl',
        color: mode('raisinBlack', 'white')(props),
        backgroundColor: mode('whiteBg', 'raisinBlack')(props),
        borderWidth: '2px',
        fontSize: '16px',
        paddingInline: '20px',
        _hover: {
          borderColor: 'ecru',
        },
        _focus: {
          borderColor: 'ecru',
        },
        _placeholder: { color: mode('silverMetallic', 'white50')(props) },
        _readOnly: {
          borderColor: 'ecru30',
          _focus: { borderColor: 'ecru30' },
          cursor: 'auto',
          outline: 'none',
        },
      },
    }),
    unstyled: (props) => ({
      field: {
        color: mode('raisinBlack', 'white')(props),
        backgroundColor: mode('whiteBg', 'raisinBlack')(props),
        fontSize: '16px',
        _placeholder: { color: mode('silverMetallic', 'white50')(props) },
      },
    }),
  },
  defaultProps: {
    variant: 'outline',
  },
};
