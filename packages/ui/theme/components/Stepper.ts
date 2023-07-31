import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers([
  'stepper',
  'step',
  'title',
  'description',
  'indicator',
  'separator',
  'icon',
  'number'
]);

const baseStyle = definePartsStyle((props) => {
  return {
    description: {},
    icon: {
      bg: mode('iGreen', 'iGreen')(props)
    },
    indicator: {
      _active: {
        bg: mode('iGreen', 'iGreen')(props)
      },
      bg: 'none',
      borderWidth: { base: '2px' }
    },
    number: {},
    separator: {},
    step: {},
    stepper: { width: { base: '100%' } },
    title: {}
  };
});

const sizes = {
  xl: definePartsStyle({
    step: defineStyle({}),
    stepper: defineStyle({}),
    title: defineStyle({})
  })
};

const green = definePartsStyle((props) => {
  return {
    description: {},
    icon: {
      color: mode('iBlack', 'iBlack')(props)
    },
    indicator: {
      '&[data-value=active]': {
        bg: 'none',
        border: 'none',
        color: mode('iGreen', 'iGreen')(props)
      },
      '&[data-value=complete]': {
        bg: mode('iLightGray', 'iLightGray')(props),
        borderColor: mode('iLightGray', 'iLightGray')(props),
        color: 'none'
      },
      '&[data-value=failed]': {
        bg: mode('iRed', 'iRed')(props),
        borderColor: mode('iRed', 'iRed')(props),
        color: mode('iBlack', 'iBlack')(props)
      },
      '&[data-value=incomplete]': {
        bg: 'none',
        borderColor: mode('iLightGray', 'iLightGray')(props),
        color: mode('iLightGray', 'iLightGray')(props)
      },
      '&[data-value=ready]': {
        bg: mode('iGreen', 'iGreen')(props),
        border: mode('iGreen', 'iGreen')(props),
        color: 'none'
      }
    },
    number: {},
    separator: {
      '&[data-value=active]': {
        bgGradient: 'linear(to-r, iGreen, iLightGray)'
      },
      '&[data-value=complete]': {
        bg: mode('iLightGray', 'iLightGray')(props)
      },
      '&[data-value=failed]': {
        bgGradient: 'linear(to-r, iRed, iLightGray)'
      },
      '&[data-value=incomplete]': {
        bg: mode('iLightGray', 'iLightGray')(props)
      },
      '&[data-value=ready]': {
        bg: mode('iLightGray', 'iLightGray')(props)
      }
    },
    step: {},
    stepper: {},
    title: {}
  };
});

const yellow = definePartsStyle((props) => {
  return {
    number: defineStyle({
      _focus: {
        boxShadow: '0px 0px 0px 3px #39FF8855'
      },
      bg: mode('iGreen', 'iGreen')(props),
      boxShadow: '0px 0px 0px 3px #39FF8855',
      height: '9px',
      width: '9px'
    }),
    separator: defineStyle({ bg: 'iGray', height: '4px' }),
    step: defineStyle({ bg: 'iGreen', height: '4px' }),
    stepper: defineStyle({
      rounded: '100px'
    }),
    title: defineStyle({})
  };
});

const red = definePartsStyle((props) => {
  return {
    number: defineStyle({
      _focus: {
        boxShadow: '0px 0px 0px 3px #39FF8855'
      },
      bg: mode('iGreen', 'iGreen')(props),
      boxShadow: '0px 0px 0px 3px #39FF8855',
      height: '9px',
      width: '9px'
    }),
    separator: defineStyle({ bg: 'iGray', height: '4px' }),
    step: defineStyle({ bg: 'iGreen', height: '4px' }),
    stepper: defineStyle({
      rounded: '100px'
    }),
    title: defineStyle({})
  };
});

export const StepperStyleConfig = defineMultiStyleConfig({
  baseStyle,
  defaultProps: {},
  sizes,
  variants: { green, red, yellow }
});
