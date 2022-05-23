import { Alert, AlertDescription, AlertIcon, AlertProps, AlertTitle } from '@chakra-ui/react';

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
