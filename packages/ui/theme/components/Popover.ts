import { popoverAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react';
import { cssVar, mode } from '@chakra-ui/theme-tools';
const $arrowBg = cssVar('popper-arrow-bg');

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys);
const baseStyle = definePartsStyle((props) => {
  return {
    arrow: {
      borderWidth: 0,
    },
    content: {
      [$arrowBg.variable]: mode('iBlack', 'iBlack')(props),
      backgroundColor: mode('iBlack', 'iBlack')(props),
      borderColor: mode('iSeparator', 'iSeparator')(props),
      borderRadius: '10px',
      borderWidth: 1,
    },
    popper: {
      borderRadius: 0,
    },
  };
});

const sizes = {
  xl: definePartsStyle({
    content: defineStyle({
      fontSize: '2xl',
      marginLeft: 6,
    }),
    header: defineStyle({
      padding: 14,
    }),
  }),
};

const warning = definePartsStyle((props) => {
  return {
    content: defineStyle({
      bg: mode('iBlack', 'iBlack')(props),
      borderColor: mode('iYellow', 'iYellow')(props),
      borderRadius: { base: '12px' },
      borderWidth: '1px',
      color: mode('iYellow', 'iYellow')(props),
      fontSize: { base: '14px' },
      fontWeight: { base: 600 },
      lineHeight: { base: '20px' },
      padding: '12px',
    }),
  };
});

export const PopoverStyleConfig = defineMultiStyleConfig({
  baseStyle,
  sizes,
  variants: { warning },
});
