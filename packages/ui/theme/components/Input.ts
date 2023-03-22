import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const InputConfigStyle: ComponentStyleConfig = {
  baseStyle: {
    field: {
      _disabled: {
        cursor: 'not-allowed',
        opacity: 0.4,
      },
      _focusVisible: {
        boxShadow: 'none',
        outline: 'none',
      },
      appearance: 'none',
      minWidth: 0,
      outline: 0,
      position: 'relative',
      transitionDuration: 'normal',
      transitionProperty: 'common',
    },
  },
  defaultProps: {
    variant: 'outline',
  },
  parts: ['field', 'element', 'addon'],
  variants: {
    outline: (props) => ({
      element: {
        color: mode('raisinBlack', 'white')(props),
        fontSize: '16px',
        pointerEvents: 'none',
        width: 'auto',
      },
      field: {
        _focus: {
          borderColor: 'ecru',
        },
        _focusVisible: {
          boxShadow: 'none',
          outline: 'none',
        },
        _hover: {
          borderColor: 'ecru',
        },
        _placeholder: { color: mode('silverMetallic', 'white50')(props) },
        _readOnly: {
          _focus: { borderColor: 'ecru30' },
          borderColor: 'ecru30',
          cursor: 'auto',
          outline: 'none',
        },
        backgroundColor: mode('whiteBg', 'raisinBlack')(props),
        borderColor: 'ecru',
        borderRadius: 'xl',
        borderWidth: '2px',
        color: mode('raisinBlack', 'white')(props),
        fontSize: '16px',
        paddingInline: '20px',
      },
    }),
    outlineLeftAddon: (props) => ({
      addon: {
        backgroundColor: mode('whiteBg', 'raisinBlack')(props),
        borderColor: 'ecru',
        borderRadius: 'xl',
        borderWidth: '2px',
        color: mode('raisinBlack', 'whiteBg')(props),
        pointerEvents: 'none',
      },
      element: {
        color: mode('raisinBlack', 'white')(props),
        fontSize: '16px',
        pointerEvents: 'none',
        width: 'auto',
      },
      field: {
        _focus: {
          borderColor: 'ecru',
        },
        _focusVisible: {
          boxShadow: 'none',
          outline: 'none',
        },
        _hover: {
          borderColor: 'ecru',
        },
        _placeholder: { color: mode('silverMetallic', 'white50')(props) },
        backgroundColor: mode('whiteBg', 'raisinBlack')(props),
        borderColor: 'ecru',
        borderLeft: 'none',
        borderRadius: 'xl',
        borderWidth: '2px',
        color: mode('raisinBlack', 'white')(props),
        fontSize: '16px',
        paddingLeft: 0,
      },
    }),
    outlineRightAddon: (props) => ({
      addon: {
        backgroundColor: mode('whiteBg', 'raisinBlack')(props),
        borderColor: 'ecru30',
        borderRadius: 'xl',
        borderWidth: '2px',
        color: mode('raisinBlack', 'whiteBg')(props),
        pointerEvents: 'none',
      },
      element: {
        color: mode('raisinBlack', 'white')(props),
        fontSize: '16px',
        pointerEvents: 'none',
        width: 'auto',
      },
      field: {
        _focus: {
          borderColor: 'ecru',
        },
        _focusVisible: {
          boxShadow: 'none',
          outline: 'none',
        },
        _hover: {
          borderColor: 'ecru',
        },
        _placeholder: { color: mode('silverMetallic', 'white50')(props) },
        _readOnly: {
          borderColor: 'ecru30',
        },
        backgroundColor: mode('whiteBg', 'raisinBlack')(props),
        borderColor: 'ecru',
        borderRadius: 'xl',
        borderWidth: '2px',
        color: mode('raisinBlack', 'white')(props),
        fontSize: '16px',
      },
    }),
    unstyled: (props) => ({
      field: {
        _focusVisible: {
          boxShadow: 'none',
          outline: 'none',
        },
        _placeholder: { color: mode('silverMetallic', 'white50')(props) },
        backgroundColor: mode('whiteBg', 'raisinBlack')(props),
        color: mode('raisinBlack', 'white')(props),
        fontSize: '16px',
      },
    }),
  },
};
