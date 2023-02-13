import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertProps,
  AlertTitle,
  Box,
  Text,
} from '@chakra-ui/react';
import React, { ReactNode } from 'react';

import { useColors } from '@ui/hooks/useColors';

export const AdminAlert = ({
  isAdmin = false,
  isAdminText = 'You are the admin!',
  isNotAdminText = 'You are not the admin!!',
  rightAdornment,
  ...alertProps
}: {
  isAdmin: boolean;
  isAdminText?: string;
  isNotAdminText?: string;
  rightAdornment?: ReactNode;
} & AlertProps) => {
  const { cAlert } = useColors();
  return (
    <Alert
      backgroundColor={cAlert.bgColor}
      borderRadius={5}
      colorScheme={isAdmin ? 'green' : 'red'}
      mt="5"
      {...alertProps}
    >
      <AlertIcon color={cAlert.iconColor} />
      <Text color="raisinBlack" size="sm">
        {isAdmin ? isAdminText : isNotAdminText}
      </Text>
      <Box h="100%" ml="auto">
        {rightAdornment}
      </Box>
    </Alert>
  );
};

interface AlertHeroProps extends AlertProps {
  title: string;
  description: string;
}

export const AlertHero = ({ title, description, ...alertProps }: AlertHeroProps) => (
  <Alert
    alignItems="center"
    borderRadius={'20px'}
    flexDirection="column"
    height="2xs"
    justifyContent="center"
    my={4}
    textAlign="center"
    {...alertProps}
  >
    <AlertIcon boxSize="40px" mr={0} />
    <AlertTitle fontSize="lg" mb={1} mt={4}>
      {title}
    </AlertTitle>
    <AlertDescription maxWidth="sm">{description}</AlertDescription>
  </Alert>
);
