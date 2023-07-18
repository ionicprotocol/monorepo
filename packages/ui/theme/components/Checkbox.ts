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
          color: mode('iWhite', 'iBlack')(props)
        },
        bg: mode('iGreen', 'iGreen')(props),
        borderColor: mode('iGreen', 'iGreen')(props),
        color: mode('iWhite', 'iBlack')(props)
      },
      _hover: {
        bg: 'none',
        color: mode('iWhite', 'iBlack')(props)
      },
      _indeterminate: {
        bg: 'iSeparator',
        color: mode('iWhite', 'iBlack')(props)
      },
      borderColor: mode('iBlack', 'iWhite')(props),
      boxShadow: 'none',
      outline: 'none'
    },
    icon: {},
    label: {
      color: mode('iBlack', 'iWhite')(props),
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
