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
      colorScheme={isAdmin ? 'green' : 'red'}
      borderRadius={5}
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
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    textAlign="center"
    my={4}
    borderRadius={'20px'}
    height="2xs"
    {...alertProps}
  >
    <AlertIcon boxSize="40px" mr={0} />
    <AlertTitle mt={4} mb={1} fontSize="lg">
      {title}
    </AlertTitle>
    <AlertDescription maxWidth="sm">{description}</AlertDescription>
  </Alert>
);
