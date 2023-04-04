import type { ComponentStyleConfig } from '@chakra-ui/theme';

export const BadgeStyleConfig: ComponentStyleConfig = {
  baseStyle: {
    alignItems: 'center',
    borderRadius: 'lg',
    display: 'inline-flex',
    fontFamily: 'heading',
    justifyContent: 'center',
    px: '2',
  },
  defaultProps: {
    size: 'md',
    variant: 'solid',
  },
};
