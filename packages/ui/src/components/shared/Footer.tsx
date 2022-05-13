import { Link, Text } from '@chakra-ui/react';
import { Column, Row } from '@ui/utils/chakraUtils';
import { useTranslation } from 'react-i18next';

import CopyrightSpacer from '@ui/components/shared/CopyrightSpacer';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <>
      <Column
        mainAxisAlignment="center"
        crossAxisAlignment="center"
        py={3}
        width="100%"
        flexShrink={0}
        mt="auto"
      >
        <Row mainAxisAlignment="center" crossAxisAlignment="center" mt={4} width="100%">
          <Link isExternal href="https://docs.rari.capital/">
            <Text color="white" mx={2} size="sm" textDecoration="underline">
              {t('Developer Docs')}
            </Text>
          </Link>

          <Text color="white" size="sm">
            ·
          </Text>

          <Link isExternal href="https://docs.midas.capital">
            <Text color="white" mx={2} size="sm" textDecoration="underline">
              {t('Learn')}
            </Text>
          </Link>

          <Text color="white" size="sm">
            ·
          </Text>

          <Link target="_blank" href="https://docs.midas.capital/security/#smart-contract-audits">
            <Text color="white" mx={2} size="sm" textDecoration="underline">
              {t('Audits')}
            </Text>
          </Link>
        </Row>
        <CopyrightSpacer forceShow />
      </Column>
    </>
  );
};

export default Footer;
