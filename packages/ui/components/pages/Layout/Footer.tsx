import { Link, Text } from '@chakra-ui/react';

import { Column, Row } from '@ui/components/shared/Flex';
import {
  MIDAS_DISCORD_URL,
  MIDAS_DOCS_URL,
  MIDAS_TELEGRAM_URL,
  MIDAS_TWITTER_URL,
} from '@ui/constants/index';
import { useColors } from '@ui/hooks/useColors';

const Footer = () => {
  const { cPage } = useColors();

  return (
    <Column
      mainAxisAlignment="center"
      crossAxisAlignment="center"
      py={8}
      width="100%"
      flexShrink={0}
      mt={24}
      gap={2}
    >
      <Row mainAxisAlignment="center" crossAxisAlignment="center" width="100%">
        <Link href={MIDAS_DOCS_URL} isExternal>
          <Text color={cPage.primary.txtColor} mx={2} fontSize="md" textDecoration="underline">
            {'Docs'}
          </Text>
        </Link>
        <Text color={cPage.primary.txtColor} fontSize="md">
          ·
        </Text>
        <Link href={MIDAS_DISCORD_URL} isExternal>
          <Text color={cPage.primary.txtColor} mx={2} fontSize="md" textDecoration="underline">
            {'Discord'}
          </Text>
        </Link>
        <Text color={cPage.primary.txtColor} fontSize="md">
          ·
        </Text>
        <Link href={MIDAS_TELEGRAM_URL} isExternal>
          <Text color={cPage.primary.txtColor} mx={2} fontSize="md" textDecoration="underline">
            {'Telegram'}
          </Text>
        </Link>
        <Text color={cPage.primary.txtColor} fontSize="md">
          ·
        </Text>
        <Link href={MIDAS_TWITTER_URL} isExternal>
          <Text color={cPage.primary.txtColor} mx={2} fontSize="md" textDecoration="underline">
            {'Twitter'}
          </Text>
        </Link>
      </Row>
      <Text color={cPage.primary.txtColor} fontSize="md" textAlign="center" width="100%">
        © {new Date().getFullYear()} Midas Capital. All rights reserved.
      </Text>
    </Column>
  );
};

export default Footer;
