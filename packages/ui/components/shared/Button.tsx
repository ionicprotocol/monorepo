import { Button, ButtonProps, IconButton, IconButtonProps, useStyleConfig } from '@chakra-ui/react';
import React from 'react';

export const CButton = ({
  isSelected,
  children,
  onClick,
  variant,
  ...props
}: {
  isSelected?: boolean;
} & ButtonProps) => {
  const styles = useStyleConfig('Button', { isSelected, variant });

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
