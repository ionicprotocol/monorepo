import { inputAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  inputAnatomy.keys
);

const baseStyle = definePartsStyle({
  addon: {},
  element: {},
  field: {
    _disabled: {
      cursor: 'not-allowed',
      opacity: 0.4
    },
    _focusVisible: {
      boxShadow: 'none !important',
      outline: 'none !important'
    },
    appearance: 'none',
    minWidth: 0,
    outline: 0
  }
});

const sizes = {
  lg: definePartsStyle({
    addon: {
      height: { base: '30px' },
      width: { base: '30px' }
    },
    element: { height: { base: '30px' }, width: { base: '30px' } },
    field: {
      borderRadius: { base: '10px' },
      fontSize: {
        base: '20px'
      },
      height: { base: '30px' },
      lineHeight: {
        base: '30px'
      }
    }
  }),
  md: definePartsStyle({
    addon: { height: { base: '20px' }, width: { base: '20px' } },
    element: { height: { base: '20px' }, width: { base: '20px' } },
    field: {
      borderRadius: { base: '8px' },
      fontSize: {
        base: '14px'
      },
      height: { base: '20px' },
      lineHeight: {
        base: '20px'
      }
    }
  }),
  sm: definePartsStyle({
    addon: {
      height: { base: '18px' },
      width: { base: '18px' }
    },
    element: {
      height: { base: '18px' },
      width: { base: '18px' }
    },
    field: {
      borderRadius: { base: '6px' },
      fontSize: {
        base: '12px'
      },
      height: { base: '18px' },
      lineHeight: {
        base: '18px'
      }
    }
  }),
  xl: definePartsStyle({
    addon: {
      height: { base: '34px' },
      width: { base: '34px' }
    },
    element: {
      height: { base: '34px' },
      width: { base: '34px' }
    },
    field: {
      borderRadius: { base: '4px' },
      fontSize: {
        base: '24px'
      },
      height: { base: '34px' },
      lineHeight: {
        base: '34px'
      }
    }
  }),
  xs: definePartsStyle({
    addon: {
      height: { base: '14px' },
      width: { base: '14px' }
    },
    element: {
      height: { base: '14px' },
      width: { base: '14px' }
    },
    field: {
      borderRadius: { base: '2px' },
      fontSize: {
        base: '10px'
      },
      height: { base: '14px' },
      lineHeight: {
        base: '14px'
      }
    }
  })
};

const ghost = definePartsStyle((props) => {
  return {
    addon: {
      backgroundColor: mode('iCardBg', 'iCardBg')(props),
      border: 'none',
      color: mode('iBlack', 'iWhite')(props),
      justifyContent: 'center',
      pl: { base: 0 },
      pointerEvents: 'none',
      pr: { base: '10px' }
    },
    element: {
      color: mode('iBlack', 'iWhite')(props),
      pointerEvents: 'none'
    },
    field: {
      _focus: {
        border: 'none'
      },
      _focusVisible: {
        boxShadow: 'none',
        outline: 'none'
      },
      _hover: {
        border: 'none'
      },
      _placeholder: { color: mode('iGray', 'iGray')(props) },
      _readOnly: {
        _focus: { border: 'none' },
        border: 'none',
        cursor: 'auto',
        outline: 'none'
      },
      backgroundColor: mode('iCardBg', 'iCardBg')(props),
      border: 'none',
      color: mode('iBlack', 'iWhite')(props),
      paddingInlineEnd: 0,
      paddingInlineStart: 0
    }
  };
});

const outlineLightGray = definePartsStyle((props) => {
  return {
    addon: {
      backgroundColor: mode('iCardBg', 'iCardBg')(props),
      borderColor: mode('iGray', 'iGray')(props),
      color: mode('iBlack', 'iWhite')(props),
      justifyContent: 'center',
      pl: { base: 0 },
      pointerEvents: 'none',
      pr: { base: '10px' }
    },
    element: {
      color: mode('iBlack', 'iWhite')(props),
      pointerEvents: 'none'
    },
    field: {
      _focus: {
        borderColor: mode('iGray', 'iGray')(props)
      },
      _focusVisible: {
        boxShadow: 'none !important',
        outline: 'none !important'
      },
      _hover: {
        borderColor: mode('iGray', 'iGray')(props)
      },
      _placeholder: { color: mode('iGray', 'iGray')(props) },
      _readOnly: {
        _focus: { border: 'none' },
        border: mode('iGray', 'iGray')(props),
        cursor: 'auto',
        outline: 'none !important'
      },
      backgroundColor: mode('iCardBg', 'iCardBg')(props),
      borderColor: mode('iGray', 'iGray')(props),
      borderWidth: '1px',
      color: mode('iBlack', 'iWhite')(props),
      paddingInlineEnd: 0,
      paddingInlineStart: 0
    }
  };
});

export const InputConfigStyle = defineMultiStyleConfig({
  baseStyle,
  defaultProps: {
    size: 'md',
    variant: 'ghost'
  },
  sizes,
  variants: { ghost, outlineLightGray }
});
