/* istanbul ignore file */

import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Code, Heading, Link, Text } from '@chakra-ui/react';
import { FallbackProps } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

const ErrorPage: React.FC<FallbackProps> = ({ error }) => {
  const { t } = useTranslation();

  return (
    <Box color="white">
      <Box bg="red.600" width="100%" p={4}>
        <Heading>{t('Whoops! Looks like something went wrong!')}</Heading>
        <Text>
          {t('You can either reload the page, or report this error to us on our')}{' '}
          <Link isExternal href="https://github.com/Rari-Capital/rari-dApp">
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
