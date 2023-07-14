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
      [$arrowBg.variable]: mode('iCardBg', 'iCardBg')(props),
      backgroundColor: mode('iCardBg', 'iCardBg')(props),
      borderColor: mode('iSeparator', 'iSeparator')(props),
      borderRadius: '10px',
      borderWidth: 1,
      p: { base: '12px' },
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

const ghost = definePartsStyle((props) => {
  return {
    body: defineStyle({
      border: 'none',
      padding: '0px',
    }),
    content: defineStyle({
      bg: 'none',
      border: 'none',
      color: mode('iWhite', 'iWhite')(props),
      fontSize: { base: '12px' },
      fontWeight: { base: 600 },
      lineHeight: { base: '18px' },
      padding: '0px',
    }),
  };
});

export const PopoverStyleConfig = defineMultiStyleConfig({
  baseStyle,
  sizes,
  variants: { ghost, warning },
});
