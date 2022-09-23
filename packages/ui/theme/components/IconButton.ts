import type { ComponentStyleConfig } from '@chakra-ui/theme';
import { mode } from '@chakra-ui/theme-tools';

export const IconButtonStyleConfig: ComponentStyleConfig = {
  baseStyle: {
    borderRadius: 'xl',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 10,
  },
  variants: {
    filter: (props) => ({
      bg: props.isSelected ? mode('ecru', 'ecru')(props) : mode('whiteBg', 'raisinBlack')(props),
      color: props.isSelected
        ? mode('raisinBlack', 'raisinBlack')(props)
        : mode('ecru', 'ecru')(props),
      borderWidth: 2,
      borderColor: mode('ecru', 'ecru')(props),
      mr: '-px',
      _active: { opacity: 0.8 },
      _hover: {
        bg: mode('ecru', 'ecru')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
        borderColor: mode('ecru', 'ecru')(props),
      },
    }),
    _outline: (props) => ({
      bg: mode('whiteBg', 'raisinBlack')(props),
      color: mode('ecru', 'ecru')(props),
      borderWidth: 2,
      borderColor: mode('ecru', 'ecru')(props),
      mr: '-px',
      _active: { opacity: 0.8 },
      _hover: {
        bg: mode('ecru', 'ecru')(props),
        color: mode('raisinBlack', 'raisinBlack')(props),
        borderColor: mode('ecru', 'ecru')(props),
      },
    }),
  },
  defaultProps: {
    variant: 'filter',
  },
};
