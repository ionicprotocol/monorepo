import { defineStyle, defineStyleConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const variants = {
  normal: defineStyle((props) => ({
    bgColor: mode('iSeparator', 'iSeparator')(props),
    borderWidth: 0,
    height: '1px',
    width: '100%'
  })),
  thick: defineStyle({
    borderRadius: 10, // set border radius to 10
    borderStyle: 'solid', // change the style of the border
    borderWidth: '5px' // change the width of the border
  })
};

const sizes = {
  xl: defineStyle({
    border: '10px solid',
    borderRadius: 'lg'
  })
};

export const DividierStyleConfig = defineStyleConfig({
  defaultProps: { variant: 'normal' },
  sizes,
  variants
});
