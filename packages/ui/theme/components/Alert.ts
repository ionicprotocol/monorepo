import { alertAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  alertAnatomy.keys
);

const baseStyle = definePartsStyle({
  container: {
    background: 'none',
    borderRadius: { base: '12px' },
    borderWidth: '1px',
    padding: { base: '12px' },
  },
  description: {
    fontSize: { base: '14px' },
  },
  icon: { strokeWidth: '0.5px' },
  spinner: {},
  title: {},
});

const xl = defineStyle({
  fontSize: 'lg',
  h: '12',
  px: '4',
});

const sizes = {
  xl: definePartsStyle({ description: xl, title: xl }),
};

const ghost = definePartsStyle((props) => {
  return {
    container: {
      borderColor: mode('iLightGray', 'iLightGray')(props),
    },
    description: {
      color: mode('iLightGray', 'iLightGray')(props),
    },
    icon: {
      color: mode('iLightGray', 'iLightGray')(props),
    },
    title: {
      color: mode('iLightGray', 'iLightGray')(props),
    },
  };
});

const success = definePartsStyle((props) => {
  return {
    container: {
      borderColor: mode('iGreen', 'iGreen')(props),
    },
    description: {
      color: mode('iGreen', 'iGreen')(props),
    },
    icon: {
      color: mode('iGreen', 'iGreen')(props),
    },
    title: {
      color: mode('iGreen', 'iGreen')(props),
    },
  };
});

const info = definePartsStyle((props) => {
  return {
    container: {
      borderColor: mode('iGreen', 'iGreen')(props),
    },
    description: {
      color: mode('iGreen', 'iGreen')(props),
    },
    icon: {
      color: mode('iGreen', 'iGreen')(props),
    },
    title: {
      color: mode('iGreen', 'iGreen')(props),
    },
  };
});

const error = definePartsStyle((props) => {
  return {
    container: {
      borderColor: mode('iRed', 'iRed')(props),
    },
    description: {
      color: mode('iRed', 'iRed')(props),
    },
    icon: {
      color: mode('iRed', 'iRed')(props),
    },
    title: {
      color: mode('iRed', 'iRed')(props),
    },
  };
});

const warning = definePartsStyle((props) => {
  return {
    container: {
      borderColor: mode('iYellow', 'iYellow')(props),
    },
    description: {
      color: mode('iYellow', 'iYellow')(props),
    },
    icon: {
      color: mode('iYellow', 'iYellow')(props),
    },
    title: {
      color: mode('iYellow', 'iYellow')(props),
    },
  };
});

export const AlertStyleConfig = defineMultiStyleConfig({
  baseStyle,
  defaultProps: { variant: 'info' },
  sizes,
  variants: { error, ghost, info, success, warning },
});
