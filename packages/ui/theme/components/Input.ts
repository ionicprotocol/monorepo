import { inputAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  inputAnatomy.keys
);

const baseStyle = definePartsStyle({
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
  },
});

const xl = defineStyle({
  fontSize: 'lg',
  h: '12',
  px: '4',
});

const sizes = {
  xl: definePartsStyle({ addon: xl, field: xl }),
};

const ghost = definePartsStyle((props) => {
  return {
    addon: {
      backgroundColor: mode('iCardBg', 'iCardBg')(props),
      border: 'none',
      color: mode('iBlack', 'iWhite')(props),
      height: { base: '20px' },
      justifyContent: 'center',
      pointerEvents: 'none',
      px: { base: 0 },
      width: { base: '20px' },
    },
    element: {
      color: mode('iBlack', 'iWhite')(props),
      fontSize: { base: '12px' },
      height: '20px',
      pointerEvents: 'none',
      width: '20px',
    },
    field: {
      _focus: {
        border: 'none',
      },
      _focusVisible: {
        boxShadow: 'none',
        outline: 'none',
      },
      _hover: {
        border: 'none',
      },
      _placeholder: { color: mode('iGray', 'iGray')(props) },
      _readOnly: {
        _focus: { border: 'none' },
        border: 'none',
        cursor: 'auto',
        outline: 'none',
      },
      backgroundColor: mode('iCardBg', 'iCardBg')(props),
      border: 'none',
      color: mode('iBlack', 'iWhite')(props),
      fontSize: '14px',
      height: { base: '20px' },
      paddingInlineEnd: 0,
      paddingInlineStart: '10px',
    },
  };
});

export const InputConfigStyle = defineMultiStyleConfig({
  baseStyle,
  defaultProps: {
    variant: 'ghost',
  },
  sizes,
  variants: { ghost },
});
