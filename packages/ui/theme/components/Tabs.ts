import { tabsAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  tabsAnatomy.keys
);

const baseStyle = definePartsStyle((props) => {
  return {
    root: {},
    tab: {
      _selected: {
        bg: 'none',
        border: 'none',
        color: mode('iBlack', 'iWhite')(props),
        mb: '-2px'
      },
      bg: 'none',
      border: 'none',
      color: mode('iGray', 'iGray')(props),
      fontSize: { base: '24px' },
      fontWeight: 600,
      lineHeight: { base: '34px' }
    },
    tablist: {
      borderBottom: 'none'
    },
    tabpanel: {
      border: 'none'
    },
    tabpanels: { border: 'none' }
  };
});

const sizes = {
  xl: definePartsStyle({
    tab: {
      fontSize: 'xl',
      px: '6',
      py: '4'
    },
    tabpanel: {
      px: '6',
      py: '4'
    }
  })
};

const ghost = definePartsStyle((props) => {
  return {
    root: {},
    tab: {
      _selected: {
        bg: 'none',
        border: 'none',
        color: mode('iBlack', 'iWhite')(props),
        mb: '-2px'
      },
      bg: 'none',
      border: 'none',
      color: mode('iGray', 'iGray')(props),
      fontSize: { base: '24px' },
      fontWeight: 600,
      lineHeight: { base: '34px' },
      p: { base: 0 }
    },
    tablist: {
      borderBottom: 'none',
      gap: { base: '16px' },
      mb: { base: '24px' }
    },
    tabpanel: {
      border: 'none'
    },
    tabpanels: { border: 'none' }
  };
});

const variants = { ghost };

export const TabsStyleConfig = defineMultiStyleConfig({
  baseStyle,
  defaultProps: { variant: 'ghost' },
  sizes,
  variants
});
