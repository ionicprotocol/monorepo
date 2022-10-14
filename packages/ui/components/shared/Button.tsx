import { Button, ButtonProps, IconButton, IconButtonProps, useStyleConfig } from '@chakra-ui/react';
import React from 'react';

export const CButton = ({
  isSelected,
  children,
  onClick,
  variant,
  color,
  ...props
}: {
  isSelected?: boolean;
  color?: string;
} & ButtonProps) => {
  const styles = useStyleConfig('Button', { isSelected, variant, color });

  return (
    <Button __css={styles} onClick={onClick} {...props}>
      {children}
    </Button>
  );
};

export const CIconButton = ({
  isSelected,
  variant,
  ...props
}: {
  isSelected?: boolean;
  variant?: string;
} & IconButtonProps) => {
  const styles = useStyleConfig('IconButton', { isSelected, variant });

  return <IconButton __css={styles} {...props} />;
};
