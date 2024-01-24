import { checkboxAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  checkboxAnatomy.keys
);

const baseStyle = definePartsStyle((props) => {
  return {
    container: {},
    control: {
      _checked: {
        _hover: {
          bg: mode('iGreen', 'iGreen')(props),
          borderColor: mode('iGreen', 'iGreen')(props),
          color: mode('iBlack', 'iBlack')(props)
        },
        bg: mode('iGreen', 'iGreen')(props),
        borderColor: mode('iGreen', 'iGreen')(props),
        color: mode('iBlack', 'iBlack')(props)
      },
      _hover: {
        bg: 'none',
        color: mode('iBlack', 'iBlack')(props)
      },
      _indeterminate: {
        bg: 'iSeparator',
        color: mode('iBlack', 'iBlack')(props)
      },
      borderColor: mode('iWhite', 'iWhite')(props),
      boxShadow: 'none',
      outline: 'none'
    },
    icon: {},
    label: {
      color: mode('iWhite', 'iWhite')(props),
      pt: '2px'
    }
  };
});

const sizes = {
  xl: definePartsStyle({
    control: defineStyle({
      boxSize: 14
    }),
    label: defineStyle({
      fontSize: '2xl',
      marginLeft: 6
    })
  })
};

const variants = {
  circular: definePartsStyle({
    control: defineStyle({
      rounded: 'full'
    })
  })
};

export const CheckboxStyleConfig = defineMultiStyleConfig({
  baseStyle,
  defaultProps: {},
  sizes,
  variants
});
