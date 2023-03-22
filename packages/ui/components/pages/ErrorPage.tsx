import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Code, Heading, Link, Text } from '@chakra-ui/react';
import type { FallbackProps } from 'react-error-boundary';

const ErrorPage: React.FC<FallbackProps> = ({ error }) => {
  return (
    <Box color="white">
      <Box bg="red.600" p={4} width="100%">
        <Heading>Whoops! Looks like something went wrong!</Heading>
        <Text>
          You can either reload the page, or report this error to us on our{' '}
          <Link href="https://github.com/Midas-Protocol/monorepo" isExternal>
            <u>GitHub</u>
            <ExternalLinkIcon mx="2px" />
          </Link>
        </Text>
      </Box>

      <Code colorScheme="red">{error.toString()}</Code>
    </Box>
  );
};

export default ErrorPage;
