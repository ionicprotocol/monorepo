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
      width="100%"
      flexShrink={0}
      mt={{ base: 4, md: 20 }}
      mb={4}
      gap={2}
    >
      <Row mainAxisAlignment="center" crossAxisAlignment="center" width="100%">
        <Link href={MIDAS_DOCS_URL} isExternal>
          <Text
            mx={2}
            variant="smText"
            textDecoration="underline"
            _hover={{ color: cPage.primary.borderColor }}
          >
            {'Docs'}
          </Text>
        </Link>
        <Text color={cPage.primary.txtColor} variant="smText">
          ·
        </Text>
        <Link href={MIDAS_DISCORD_URL} isExternal>
          <Text
            color={cPage.primary.txtColor}
            mx={2}
            variant="smText"
            textDecoration="underline"
            _hover={{ color: cPage.primary.borderColor }}
          >
            {'Discord'}
          </Text>
        </Link>
        <Text color={cPage.primary.txtColor} variant="smText">
          ·
        </Text>
        <Link href={MIDAS_TELEGRAM_URL} isExternal>
          <Text
            color={cPage.primary.txtColor}
            mx={2}
            variant="smText"
            textDecoration="underline"
            _hover={{ color: cPage.primary.borderColor }}
          >
            {'Telegram'}
          </Text>
        </Link>
        <Text color={cPage.primary.txtColor} variant="smText">
          ·
        </Text>
        <Link href={MIDAS_TWITTER_URL} isExternal>
          <Text
            color={cPage.primary.txtColor}
            mx={2}
            variant="smText"
            textDecoration="underline"
            _hover={{ color: cPage.primary.borderColor }}
          >
            {'Twitter'}
          </Text>
        </Link>
      </Row>
      <Text color={cPage.primary.txtColor} variant="smText" textAlign="center" width="100%">
        © {new Date().getFullYear()} Midas Capital. All rights reserved.
      </Text>
    </Column>
  );
};

export default Footer;
