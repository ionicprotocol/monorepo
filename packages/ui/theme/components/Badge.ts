import type { ComponentStyleConfig } from '@chakra-ui/theme';

export const BadgeStyleConfig: ComponentStyleConfig = {
  baseStyle: {
    borderRadius: 'lg',
    fontFamily: 'heading',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    px: '2',
  },
  defaultProps: {
    size: 'md',
    variant: 'solid',
  },
};
