import { modalAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/styled-system';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle((props) => {
  return {
    body: {},
    closeButton: {
      boxShadow: 'none',
      outline: 'none'
    },
    dialog: {
      backgroundColor: mode('iCardBg', 'iCardBg')(props),
      border: 'none',
      borderRadius: { base: '24px' }
    },
    header: {
      fontSize: { base: '24px' },
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
