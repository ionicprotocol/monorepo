import { Link, Text } from '@chakra-ui/react';

import CopyrightSpacer from '@ui/components/shared/CopyrightSpacer';
import { Column, Row } from '@ui/utils/chakraUtils';

const Footer = () => {
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
              Developer Docs
            </Text>
          </Link>

          <Text color="white" size="sm">
            ·
          </Text>

          <Link isExternal href="https://docs.midas.capital">
            <Text color="white" mx={2} size="sm" textDecoration="underline">
              Learn
            </Text>
          </Link>

          <Text color="white" size="sm">
            ·
          </Text>

          <Link target="_blank" href="https://docs.midas.capital/security/#smart-contract-audits">
            <Text color="white" mx={2} size="sm" textDecoration="underline">
              Audits
            </Text>
          </Link>
        </Row>
        <CopyrightSpacer forceShow />
      </Column>
    </>
  );
};

export default Footer;
