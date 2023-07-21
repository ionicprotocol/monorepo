import type { ButtonProps, IconButtonProps } from '@chakra-ui/react';
import { Button, IconButton, useStyleConfig } from '@chakra-ui/react';
import React from 'react';

export const CButton = ({
  isSelected,
  children,
  onClick,
  variant,
  color,
  ...props
}: ButtonProps & {
  color?: string;
  isSelected?: boolean;
}) => {
  const styles = useStyleConfig('Button', { color, isSelected, variant });

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
}: IconButtonProps & {
  isSelected?: boolean;
  variant?: string;
}) => {
  const styles = useStyleConfig('IconButton', { isSelected, variant });

  return <IconButton __css={styles} {...props} />;
};
