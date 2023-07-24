import { modalAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/styled-system';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle((props) => {
  return {
    body: {
      '&::-webkit-scrollbar': {
        display: 'block',
        height: '4px',
        width: '4px'
      },
      '&::-webkit-scrollbar-corner': {
        display: 'none'
      },
      '&::-webkit-scrollbar-thumb': {
        background: mode('iLightGray', 'iLightGray')(props)
      },

      '&::-webkit-scrollbar-track': {
        height: '4px',
        width: '8px'
      },
      color: mode('iLightGray', 'iLightGray')(props),
      overflowY: 'scroll',
      p: { base: 0 }
    },
    closeButton: {
      boxShadow: 'none',
      outline: 'none',
      right: { base: '24px' }
    },
    dialog: {
      backgroundColor: mode('iCardBg', 'iCardBg')(props),
      border: 'none',
      borderRadius: { base: '24px' },
      color: mode('iLightGray', 'iLightGray')(props),
      gap: { base: '20px' },
      minWidth: { base: '600px' },
      px: { base: '32px' },
      py: { base: '24px' },
      width: { base: '600px' }
    },
    dialogContainer: {},
    footer: { p: { base: 0 } },
    header: {
      color: mode('iLightGray', 'iLightGray')(props),
      fontSize: { base: '24px' },
      fontWeight: 600,
      lineHeight: { base: '34px' },
      p: { base: 0 },
      textAlign: 'left'
    },
    overlay: {}
  };
});

const xl = defineStyle({
  fontSize: 'xl',
  px: '6',
  py: '2'
});

const sm = defineStyle({
  fontSize: 'sm',
  py: '6'
});

const sizes = {
  xl: definePartsStyle({ dialog: xl, header: sm })
};

const purple = definePartsStyle((props) => {
  return {
    dialog: {
      bg: mode('iCardBg', 'iCardBg')(props),
      borderRadius: 'md'
    }
  };
});

export const ModalStyleConfig = defineMultiStyleConfig({
  baseStyle,
  defaultProps: {},
  sizes,
  variants: { purple }
});
