import { Link, Stack, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaDiscord, FaTelegram, FaTwitter } from 'react-icons/fa';
import { SiGitbook } from 'react-icons/si';

import { Column, Row } from '@ui/components/shared/Flex';
import { SimpleTooltip } from '@ui/components/shared/SimpleTooltip';
import {
  MIDAS_DISCORD_URL,
  MIDAS_DOCS_URL,
  MIDAS_TELEGRAM_URL,
  MIDAS_TWITTER_URL,
} from '@ui/constants/index';
import { useMultiMidas } from '@ui/context/MultiMidasContext';
import { useColors } from '@ui/hooks/useColors';

const Footer = () => {
  const { cPage } = useColors();
  const { isSidebarCollapsed } = useMultiMidas();

  return (
    <Column crossAxisAlignment="center" flexShrink={0} gap={2} mainAxisAlignment="center">
      <Row crossAxisAlignment="center" mainAxisAlignment="center" width="100%">
        <Stack direction={isSidebarCollapsed ? 'column' : 'row'} spacing={{ base: 4, md: 4 }}>
          <Link href={MIDAS_DOCS_URL} isExternal>
            <SimpleTooltip label="Documentation">
              <motion.div whileHover={{ scale: 1.2 }}>
                <SiGitbook color={cPage.primary.borderColor} fontSize={26} />
              </motion.div>
            </SimpleTooltip>
          </Link>
          <Link href={MIDAS_DISCORD_URL} isExternal>
            <SimpleTooltip label="Discord">
              <motion.div whileHover={{ scale: 1.2 }}>
                <FaDiscord color={cPage.primary.borderColor} fontSize={24} />
              </motion.div>
            </SimpleTooltip>
          </Link>
          <Link href={MIDAS_TELEGRAM_URL} isExternal>
            <SimpleTooltip label="Telegram">
              <motion.div whileHover={{ scale: 1.2 }}>
                <FaTelegram color={cPage.primary.borderColor} fontSize={20} />
              </motion.div>
            </SimpleTooltip>
          </Link>
          <Link href={MIDAS_TWITTER_URL} isExternal>
            <SimpleTooltip label="Twitter">
              <motion.div whileHover={{ scale: 1.2 }}>
                <FaTwitter color={cPage.primary.borderColor} fontSize={20} />
              </motion.div>
            </SimpleTooltip>
          </Link>
        </Stack>
      </Row>
      {!isSidebarCollapsed ? (
        <VStack spacing={0}>
          <Text color={cPage.primary.txtColor} size="sm" textAlign="center" width="100%">
            © {new Date().getFullYear()} Midas Capital
          </Text>
          <Text color={cPage.primary.txtColor} size="sm" textAlign="center" width="100%">
            All rights reserved
          </Text>
        </VStack>
      ) : null}
    </Column>
  );
};

export default Footer;
