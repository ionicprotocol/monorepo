import { Alert, AlertDescription, AlertIcon, AlertProps } from '@chakra-ui/alert';
import { Link, Text } from '@chakra-ui/react';
import React from 'react';

export const Banner = ({
  text,
  linkText,
  linkUrl,
  status = 'warning',
  ...alertProps
}: {
  text: string;
  linkText?: string;
  linkUrl?: string;
  status?: string;
} & AlertProps) => {
  return (
    <Alert justifyContent="center" status={status} {...alertProps}>
      <AlertIcon />
      <AlertDescription>
        <Text size="md">
          {text}
          {linkText && linkUrl && (
            <Link fontWeight="bold" href={linkUrl} isExternal>
              {linkText}
            </Link>
          )}
        </Text>
      </AlertDescription>
    </Alert>
  );
};
